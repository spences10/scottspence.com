import { INGEST_TOKEN } from '$app/env/private';
import * as v from 'valibot';
import { run_task, tasks, type TaskKey } from './tasks';

/**
 * === GETTING PRODUCTION DATA LOCALLY ===
 *
 * Step 1: Update production database with latest posts/stats
 *
for task in "update_posts" "update_embeddings" "update_related_posts"; do
	curl -X POST https://scottspence.com/api/ingest \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer $INGEST_TOKEN" \
		-d "{\"task\": \"$task\"}"
	echo
done
 *
 * Step 2: Create a backup of production database
 *
curl -X POST https://scottspence.com/api/ingest \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $INGEST_TOKEN" \
	-d '{"task": "backup_database"}'
 *
 * Step 3: Back up local DB (if exists), then download production
 *
 * IMPORTANT: Always back up the local DB before overwriting.
 * Downloading over a running DB can corrupt it.
 *
# Stop dev server first, then:
[ -f data/site-data.db ] && cp data/site-data.db data/site-data.db.bak
rm -f data/site-data.db
curl -H "Authorization: Bearer $INGEST_TOKEN" \
		https://scottspence.com/api/ingest/download \
		-o data/site-data.db
# If download fails, restore: cp data/site-data.db.bak data/site-data.db
 *
 * Step 4: Restart dev server to clear caches
 *
 * === RUNNING TASKS LOCALLY ===
 *
 * Update local database with latest posts/stats
 *
for task in "update_posts" "update_embeddings" "update_related_posts"; do
	curl -X POST http://localhost:5173/api/ingest \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer $INGEST_TOKEN" \
		-d "{\"task\": \"$task\"}"
	echo
done
 *
 * === SINGLE TASK EXAMPLES ===
 *
 * Production:
 *
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "update_posts"}'
 *
 * Localhost:
 *
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "update_posts"}'
 *
 * === TASKS WITH DATA ===
 *
 * Sync blocked domains (add/remove):
 *
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "sync_blocked_domains", "data": {"add": ["spamsite"], "remove": ["falsepositivesite"]}}'
 *
 * Preview Standard.site records without writing:
 *
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "standard_site", "data": {"mode": "preview"}}'
 *
 * Publish after reviewing the preview:
 *
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "standard_site", "data": {"mode": "publish", "confirm": true}}'
 */

interface RequestBody {
	task: TaskKey;
	data?: unknown;
}

export const POST = async ({
	request,
	fetch,
}: {
	request: Request;
	fetch: typeof globalThis.fetch;
}) => {
	try {
		const body: RequestBody = await request.json();
		const task_key = body.task;

		// Check authorisation first (prevents task enumeration)
		const auth_header = request.headers.get('Authorization');
		const token = auth_header?.replace('Bearer ', '');

		if (!token || token !== INGEST_TOKEN) {
			return Response.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// Get the task config (after auth check)
		if (!Object.hasOwn(tasks, task_key)) {
			return Response.json(
				{
					message:
						'Specified task does not exist or is not a function',
				},
				{ status: 400 },
			);
		}

		console.log(`Executing task: ${task_key}`);

		try {
			const result = await run_task(task_key, fetch, body.data);

			console.log(`Task ${task_key} completed with result:`, result);
			return Response.json(result);
		} catch (task_error) {
			// Validation errors are client errors (400)
			if (v.isValiError(task_error)) {
				return Response.json(
					{
						message: 'Invalid request data',
						errors: task_error.issues.map((i) => i.message),
					},
					{ status: 400 },
				);
			}

			console.error(`Error executing task ${task_key}:`, task_error);
			return Response.json(
				{
					message: `Error executing task ${task_key}`,
					error:
						task_error instanceof Error
							? task_error.message
							: 'Unknown error',
				},
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error('Error in POST /api/ingest:', error);
		const error_message =
			error instanceof Error ? error.message : 'Unknown error';
		const error_stack = error instanceof Error ? error.stack : '';
		return Response.json(
			{
				message: 'Error processing the request',
				error: error_message,
				stack: error_stack,
			},
			{ status: 500 },
		);
	}
};
