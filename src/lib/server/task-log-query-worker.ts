import { constants, DatabaseSync } from 'node:sqlite';

// This is a native Node entry, like start.ts. No app imports or credentials.
const tables = new Set([
	'task_runs',
	'task_events',
	'sqlite_schema',
	'sqlite_master',
]);
const functions = new Set([
	'count',
	'sum',
	'total',
	'avg',
	'min',
	'max',
	'round',
	'abs',
	'coalesce',
	'ifnull',
	'nullif',
	'typeof',
	'length',
	'lower',
	'upper',
	'substr',
	'substring',
	'trim',
	'ltrim',
	'rtrim',
	'replace',
	'instr',
	'date',
	'time',
	'datetime',
	'strftime',
	'julianday',
	'unixepoch',
	'json_extract',
	'json_valid',
	'json_type',
	'group_concat',
	'like',
	'glob',
	'row_number',
	'rank',
	'dense_rank',
	'lag',
	'lead',
]);

process.once(
	'message',
	(input: {
		filename: string;
		query: string;
		params: (string | number | boolean | null)[];
	}) => {
		let db: DatabaseSync | undefined;
		let response;
		try {
			db = new DatabaseSync(input.filename, {
				readOnly: true,
				timeout: 100,
			});
			db.exec(
				'PRAGMA query_only = ON; PRAGMA trusted_schema = OFF; PRAGMA hard_heap_limit = 33554432;',
			);
			const real_tables = new Set(
				db
					.prepare(
						"SELECT name FROM sqlite_schema WHERE type IN ('table', 'view')",
					)
					.all()
					.map((row) => row.name),
			);
			db.setAuthorizer((action, table, fn, database) => {
				if (
					action === constants.SQLITE_SELECT ||
					action === constants.SQLITE_RECURSIVE
				)
					return constants.SQLITE_OK;
				if (
					action === constants.SQLITE_READ &&
					((database === 'main' && tables.has(table ?? '')) ||
						// CTEs and count(*) reads can have a null database name.
						(database === null &&
							(tables.has(table ?? '') ||
								!real_tables.has(table ?? ''))))
				)
					return constants.SQLITE_OK;
				if (
					action === constants.SQLITE_FUNCTION &&
					functions.has((fn ?? '').toLowerCase())
				)
					return constants.SQLITE_OK;
				return constants.SQLITE_DENY;
			});
			const sql = input.query.trim();
			if (!/^(select|with)\b/i.test(sql))
				throw new Error('Expected SELECT or WITH');
			const statement = db.prepare(sql);
			const without_terminator = (text: string) =>
				text.trim().replace(/;$/, '').trim();
			if (
				without_terminator(statement.sourceSQL) !==
				without_terminator(sql)
			)
				throw new Error('Only one statement is allowed');
			const rows: Record<string, unknown>[] = [];
			let bytes = 0;
			let truncated = false;
			for (const row of statement.iterate(
				...input.params.map((value) =>
					typeof value === 'boolean' ? Number(value) : value,
				),
			)) {
				const size = Buffer.byteLength(JSON.stringify(row));
				if (rows.length === 200 || bytes + size > 256 * 1024) {
					truncated = true;
					break;
				}
				rows.push(row);
				bytes += size;
			}
			response = {
				ok: true,
				rows,
				count: rows.length,
				truncated,
				max_rows: 200,
			};
		} catch {
			response = { ok: false };
		} finally {
			db?.close();
		}
		process.send?.(response, () => {
			if (process.connected) process.disconnect?.();
		});
	},
);
