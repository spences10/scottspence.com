import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import * as v from 'valibot'
import { backfill_github_activity } from './backfill-github-activity'
import { backup_database } from './backup-database'
import { cleanup_analytics } from './cleanup-analytics'
import { daily_github_activity } from './daily-github-activity'
import { export_training_data } from './export-training-data'
import { fetch_github_activity } from './fetch-github-activity'
import { generate_newsletter } from './generate-newsletter'
import { index_now } from './index-now'
import { newsletter_send } from './newsletter-send'
import { pull_database } from './pull-database'
import { restore_database } from './restore-database'
import { rollup_analytics } from './rollup-analytics'
import { send_newsletter_reminder } from './send-newsletter-reminder'
import {
	sync_blocked_domains,
	validate_sync_blocked_domains,
} from './sync-blocked-domains'
import { update_embeddings } from './update-embeddings'
import { update_posts } from './update-posts'
import { update_related_posts_table } from './update-related-posts'

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
 * Step 3: Download the backup to local
 *
curl -H "Authorization: Bearer $INGEST_TOKEN" \
		https://scottspence.com/api/ingest/download \
		-o data/site-data.db
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
 */

// Define generic task function
type TaskFunction<TArgs = any, TResult = any> = (
	...args: TArgs[]
) => Promise<TResult>

// Define the type for the keys in tasks object
type TaskKey =
	| 'update_posts'
	| 'update_embeddings'
	| 'update_related_posts'
	| 'index_now'
	| 'export_training_data'
	| 'backup_database'
	| 'pull_database'
	| 'restore_database'
	| 'newsletter_send'
	| 'fetch_github_activity'
	| 'backfill_github_activity'
	| 'daily_github_activity'
	| 'generate_newsletter'
	| 'send_newsletter_reminder'
	| 'rollup_analytics'
	| 'cleanup_analytics'
	| 'sync_blocked_domains'

// Task function type for data-expecting tasks
type DataTaskFunction = (data: unknown) => Promise<unknown>

// Define the type for tasks object
interface TaskConfig {
	function: TaskFunction | DataTaskFunction
	expects_fetch: boolean
	expects_data?: boolean
	validate_data?: (data: unknown) => unknown
}

interface TaskType {
	[key: string]: TaskConfig
}

// Define the type for the expected structure of request body
interface RequestBody {
	task: TaskKey
	data?: unknown
}

// Define a mapping from task names to functions
const tasks: TaskType = {
	update_posts: {
		function: update_posts,
		expects_fetch: false,
	},
	index_now: {
		function: index_now,
		expects_fetch: true,
	},
	update_embeddings: {
		function: update_embeddings,
		expects_fetch: false,
	},
	update_related_posts: {
		function: update_related_posts_table,
		expects_fetch: false,
	},
	export_training_data: {
		function: export_training_data,
		expects_fetch: false,
	},
	backup_database: {
		function: backup_database,
		expects_fetch: false,
	},
	pull_database: {
		function: pull_database,
		expects_fetch: false,
	},
	restore_database: {
		function: restore_database,
		expects_fetch: false,
	},
	newsletter_send: {
		function: newsletter_send,
		expects_fetch: false,
	},
	fetch_github_activity: {
		function: fetch_github_activity,
		expects_fetch: false,
	},
	backfill_github_activity: {
		function: backfill_github_activity,
		expects_fetch: false,
	},
	daily_github_activity: {
		function: daily_github_activity,
		expects_fetch: false,
	},
	generate_newsletter: {
		function: generate_newsletter,
		expects_fetch: false,
	},
	send_newsletter_reminder: {
		function: send_newsletter_reminder,
		expects_fetch: false,
	},
	rollup_analytics: {
		function: rollup_analytics,
		expects_fetch: false,
	},
	cleanup_analytics: {
		function: cleanup_analytics,
		expects_fetch: false,
	},
	sync_blocked_domains: {
		function: sync_blocked_domains,
		expects_fetch: false,
		expects_data: true,
		validate_data: validate_sync_blocked_domains,
	},
}

export const POST = async ({ request, fetch }) => {
	try {
		const body: RequestBody = await request.json()
		const task_key = body.task

		// Check authorisation first (prevents task enumeration)
		const auth_header = request.headers.get('Authorization')
		const token = auth_header?.replace('Bearer ', '')

		if (!token || token !== env.INGEST_TOKEN) {
			return json({ message: 'Unauthorized' }, { status: 401 })
		}

		// Get the task config (after auth check)
		const task = tasks[task_key]
		if (!task || typeof task.function !== 'function') {
			return json(
				{
					message:
						'Specified task does not exist or is not a function',
				},
				{ status: 400 },
			)
		}

		console.log(`Executing task: ${task_key}`)

		try {
			let result

			if (task.expects_data && task.validate_data) {
				// Validate and pass data to task
				const validated_data = task.validate_data(body.data)
				result = await (task.function as DataTaskFunction)(
					validated_data,
				)
			} else if (task.expects_fetch) {
				result = await (task.function as TaskFunction)(fetch)
			} else {
				result = await (task.function as TaskFunction)()
			}

			console.log(`Task ${task_key} completed with result:`, result)
			return json(result)
		} catch (task_error) {
			// Validation errors are client errors (400)
			if (v.isValiError(task_error)) {
				return json(
					{
						message: 'Invalid request data',
						errors: task_error.issues.map((i) => i.message),
					},
					{ status: 400 },
				)
			}

			console.error(`Error executing task ${task_key}:`, task_error)
			return json(
				{
					message: `Error executing task ${task_key}`,
					error:
						task_error instanceof Error
							? task_error.message
							: 'Unknown error',
				},
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Error in POST /api/ingest:', error)
		const error_message =
			error instanceof Error ? error.message : 'Unknown error'
		const error_stack = error instanceof Error ? error.stack : ''
		return json(
			{
				message: 'Error processing the request',
				error: error_message,
				stack: error_stack,
			},
			{ status: 500 },
		)
	}
}
