import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

const run_query_schema = v.object({
	query: v.string(),
	params: v.optional(
		v.array(
			v.union([v.string(), v.number(), v.boolean(), v.null_()]),
		),
	),
})

export type RunQueryData = v.InferOutput<typeof run_query_schema>

export const validate_run_query = (data: unknown): RunQueryData => {
	return v.parse(run_query_schema, data)
}

export const run_query = async (data: RunQueryData) => {
	const { query, params } = data
	const trimmed = query.trimStart().toUpperCase()

	if (
		trimmed.startsWith('SELECT') ||
		trimmed.startsWith('PRAGMA') ||
		trimmed.startsWith('EXPLAIN')
	) {
		const stmt = sqlite_client.prepare(query)
		const rows = params ? stmt.all(...params) : stmt.all()
		return { type: 'read' as const, rows, count: rows.length }
	}

	const stmt = sqlite_client.prepare(query)
	const result = params ? stmt.run(...params) : stmt.run()

	return {
		type: 'write' as const,
		changes: result.changes,
		last_insert_rowid: result.lastInsertRowid,
	}
}
