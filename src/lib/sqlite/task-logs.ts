import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type TaskTrigger = 'manual' | 'scheduled';
export type TaskLogLevel = 'info' | 'warn' | 'error';
export type TaskLogDetails = Record<string, number | boolean | null>;

export function sanitise_task_log(
	value: unknown,
	secrets: string[] = [],
) {
	let text =
		value instanceof Error
			? value.message
			: typeof value === 'string'
				? value
				: 'Task failed';
	for (const secret of secrets
		.filter((value) => value.length >= 4)
		.sort((a, b) => b.length - a.length)) {
		for (const form of new Set([
			secret,
			encodeURIComponent(secret),
		])) {
			text = text.replaceAll(form, '[REDACTED]');
		}
	}
	return text
		.replace(/https?:\/\/[^\s<>"']+/gi, '[URL REDACTED]')
		.replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, '[REDACTED]')
		.replace(
			/((?:api[_-]?key|token|password|secret|authorization|cookie|passphrase)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
			'$1[REDACTED]',
		)
		.replace(
			/\b(?:gh[pousr]_[\w]+|github_pat_[\w]+|sk-[\w-]+)\b/g,
			'[REDACTED]',
		)
		.replace(/[^\P{Cc}\t\n]/gu, '')
		.slice(0, 2048);
}

// Review metric names here rather than copying arbitrary numeric API fields.
const detail_keys = new Set([
	'processed',
	'total',
	'count',
	'bytes',
	'old_backups_deleted',
	'batch',
	'batch_size',
	'total_posts',
	'deleted',
	'retention_days',
	'new',
	'existing',
	'added',
	'removed',
	'document_count',
	'writes_performed',
	'published',
	'bots_flagged',
	'visitors_flagged',
	'daily',
	'breakdowns',
	'post_referrers',
	'bot_views',
	'monthly',
	'yearly',
	'all_time',
	'success',
	'vacuumed',
	'updated',
	'skipped',
	'failed',
	'error_count',
]);

function safe_details(details?: TaskLogDetails) {
	if (!details) return null;
	return JSON.stringify(
		Object.fromEntries(
			Object.entries(details)
				.filter(
					([key, value]) =>
						detail_keys.has(key) &&
						(value === null ||
							typeof value === 'boolean' ||
							(typeof value === 'number' && Number.isFinite(value))),
				)
				.slice(0, 32),
		),
	);
}

function interrupt_runs(db: DatabaseSync, owner_id: string) {
	const now = Date.now();
	const rows = db
		.prepare(
			"SELECT id FROM task_runs WHERE owner_id = ? AND status IN ('queued', 'running')",
		)
		.all(owner_id);
	db.prepare(`UPDATE task_runs SET status = 'interrupted', finished_at = ?,
		duration_ms = CASE WHEN started_at IS NULL THEN NULL ELSE MAX(0, ? - started_at) END,
		error_message = 'Process exited before the task completed'
		WHERE owner_id = ? AND status IN ('queued', 'running')`).run(
		now,
		now,
		owner_id,
	);
	const event = db.prepare(
		"INSERT INTO task_events (run_id, created_at, level, message) VALUES (?, ?, 'error', 'Process exited before the task completed')",
	);
	for (const row of rows) event.run(row.id as string, now);
	return rows.length;
}

// Called only after the supervisor has observed this specific process exit.
export function interrupt_task_log_owner(
	filename: string,
	owner_id: string,
) {
	const db = new DatabaseSync(filename, { timeout: 100 });
	try {
		db.exec('BEGIN IMMEDIATE');
		const count = interrupt_runs(db, owner_id);
		db.exec('COMMIT');
		return count;
	} finally {
		if (db.isTransaction) db.exec('ROLLBACK');
		db.close();
	}
}

export class TaskLogStore {
	readonly owner_id = randomUUID();
	readonly owner_host = hostname();
	private readonly db: DatabaseSync;
	readonly filename: string;
	private readonly deployment_id: string;
	private readonly secrets: string[];

	constructor(
		filename: string,
		deployment_id: string,
		secrets: string[] = [],
	) {
		this.filename = filename;
		this.deployment_id = deployment_id;
		this.secrets = secrets;
		mkdirSync(dirname(filename), { recursive: true });
		this.db = new DatabaseSync(filename, { timeout: 100 });
		try {
			this.db.exec(
				'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
			);
			this.db.exec(
				readFileSync('src/lib/sqlite/task-logs.sql', 'utf8'),
			);
			// Recover only owners proven dead in our own PID namespace.
			// A stale timestamp or a different container is not proof of death.
			const owners = this.db
				.prepare(
					"SELECT DISTINCT owner_id, owner_pid FROM task_runs WHERE owner_host = ? AND status IN ('queued', 'running')",
				)
				.all(this.owner_host);
			for (const owner of owners) {
				try {
					process.kill(Number(owner.owner_pid), 0);
				} catch (error) {
					if ((error as NodeJS.ErrnoException).code === 'ESRCH') {
						this.transaction(() =>
							interrupt_runs(this.db, owner.owner_id as string),
						);
					}
				}
			}
		} catch (error) {
			this.db.close();
			throw error;
		}
	}

	private transaction<T>(callback: () => T): T {
		this.db.exec('BEGIN IMMEDIATE');
		try {
			const result = callback();
			this.db.exec('COMMIT');
			return result;
		} catch (error) {
			this.db.exec('ROLLBACK');
			throw error;
		}
	}

	queue(
		task_name: string,
		trigger: TaskTrigger,
		scheduled_at: number | null = null,
	) {
		return this.transaction(() => {
			const id = randomUUID();
			this.db
				.prepare(`INSERT INTO task_runs
				(id, task_name, trigger, status, scheduled_at, queued_at, deployment_id, owner_id, owner_pid, owner_host)
				VALUES (?, ?, ?, 'queued', ?, ?, ?, ?, ?, ?)`)
				.run(
					id,
					task_name,
					trigger,
					scheduled_at,
					Date.now(),
					this.deployment_id,
					this.owner_id,
					process.pid,
					this.owner_host,
				);
			this.event(id, 'info', 'Task queued');
			return id;
		});
	}

	start(id: string) {
		this.transaction(() => {
			this.db
				.prepare(
					"UPDATE task_runs SET status = 'running', started_at = ? WHERE id = ? AND owner_id = ? AND status = 'queued'",
				)
				.run(Date.now(), id, this.owner_id);
			this.event(id, 'info', 'Task started');
		});
	}

	finish(
		id: string,
		status: 'succeeded' | 'failed',
		error?: unknown,
		details?: TaskLogDetails,
	) {
		this.transaction(() => {
			const now = Date.now();
			const failed = status === 'failed';
			const message = failed
				? sanitise_task_log(error, this.secrets)
				: null;
			this.db
				.prepare(`UPDATE task_runs SET status = ?, finished_at = ?, duration_ms = MAX(0, ? - started_at), error_message = ?
				WHERE id = ? AND owner_id = ? AND status IN ('queued', 'running')`)
				.run(
					failed ? 'failed' : 'succeeded',
					now,
					now,
					message,
					id,
					this.owner_id,
				);
			this.event(
				id,
				failed ? 'error' : 'info',
				message ?? 'Task completed',
				details,
			);
		});
	}

	skip(task_name: string, scheduled_at: number, reason: string) {
		return this.transaction(() => {
			const id = this.insert_skipped(task_name, scheduled_at);
			this.event(id, 'warn', reason);
			return id;
		});
	}

	private insert_skipped(task_name: string, scheduled_at: number) {
		const id = randomUUID();
		const now = Date.now();
		this.db
			.prepare(`INSERT INTO task_runs
			(id, task_name, trigger, status, scheduled_at, queued_at, finished_at, deployment_id, owner_id, owner_pid, owner_host)
			VALUES (?, ?, 'scheduled', 'skipped', ?, ?, ?, ?, ?, ?, ?)`)
			.run(
				id,
				task_name,
				scheduled_at,
				now,
				now,
				this.deployment_id,
				this.owner_id,
				process.pid,
				this.owner_host,
			);
		return id;
	}

	event(
		id: string,
		level: TaskLogLevel,
		message: string,
		details?: TaskLogDetails,
	) {
		this.db
			.prepare(
				'INSERT INTO task_events (run_id, created_at, level, message, details_json) VALUES (?, ?, ?, ?, ?)',
			)
			.run(
				id,
				Date.now(),
				level,
				sanitise_task_log(message, this.secrets),
				safe_details(details),
			);
	}

	purge(now = Date.now()) {
		const cutoff = now - 30 * 24 * 60 * 60 * 1000;
		const result = this.db
			.prepare('DELETE FROM task_runs WHERE queued_at < ?')
			.run(cutoff);
		return { deleted: result.changes, retention_days: 30 };
	}

	close() {
		this.db.close();
	}
}
