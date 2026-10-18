import { get_task_log_store } from '#lib/server/task-logs.js';
import { fork } from 'node:child_process';
import { resolve } from 'node:path';
import * as v from 'valibot';

const schema = v.object({
	query: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1),
		v.maxLength(10_000),
	),
	params: v.optional(
		v.pipe(
			v.array(
				v.union([
					v.pipe(v.string(), v.maxLength(4096)),
					v.pipe(v.number(), v.finite()),
					v.boolean(),
					v.null_(),
				]),
			),
			v.maxLength(100),
		),
		[],
	),
});

export const validate_query_task_logs = (data: unknown) =>
	v.parse(schema, data);
export type TaskLogQuery = v.InferOutput<typeof schema>;

interface QueryResult {
	rows: Record<string, unknown>[];
	count: number;
	truncated: boolean;
	max_rows: number;
}

export class TaskLogQueryError extends Error {
	constructor(
		message: string,
		readonly status = 400,
	) {
		super(message);
	}
}

let active_queries = 0;

export function query_task_logs(
	data: TaskLogQuery,
	filename = get_task_log_store().filename,
): Promise<QueryResult> {
	if (active_queries >= 2)
		throw new TaskLogQueryError(
			'Too many log queries; try again shortly',
			503,
		);
	active_queries++;
	return new Promise((resolve_result, reject) => {
		// A separate process gives even native SQLite work a hard deadline.
		// Do not inherit app credentials or print SQL/parameters to output.
		let child: ReturnType<typeof fork>;
		try {
			child = fork(
				resolve('src/lib/server/task-log-query-worker.ts'),
				[],
				{
					stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
					env: {},
					execArgv: ['--max-old-space-size=64'],
				},
			);
		} catch {
			active_queries--;
			reject(
				new TaskLogQueryError('Could not start a log query', 503),
			);
			return;
		}
		let finished = false;
		const finish = (
			error?: TaskLogQueryError,
			result?: QueryResult,
		) => {
			if (finished) return;
			finished = true;
			active_queries--;
			clearTimeout(timer);
			if (error) {
				child.kill('SIGKILL');
				reject(error);
			} else {
				resolve_result(result!);
			}
		};
		const timer = setTimeout(
			() =>
				finish(
					new TaskLogQueryError(
						'Log query exceeded the two-second time limit',
					),
				),
			2000,
		);
		child.once(
			'message',
			(response: QueryResult & { ok: boolean }) => {
				if (response.ok)
					finish(undefined, {
						rows: response.rows,
						count: response.count,
						truncated: response.truncated,
						max_rows: response.max_rows,
					});
				else
					finish(
						new TaskLogQueryError(
							'Query rejected. Use a single read-only SELECT against task_runs, task_events or sqlite_schema',
						),
					);
			},
		);
		child.once('error', () =>
			finish(
				new TaskLogQueryError('Could not start a log query', 503),
			),
		);
		child.once('exit', () =>
			finish(
				new TaskLogQueryError(
					'Log query could not complete within its resource limits',
				),
			),
		);
		child.send(
			{ filename, query: data.query, params: data.params },
			(error) => {
				if (error)
					finish(
						new TaskLogQueryError('Could not start a log query', 503),
					);
			},
		);
	});
}
