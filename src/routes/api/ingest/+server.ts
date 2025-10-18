import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import { adhoc_newsletter_send } from './adhoc-newsletter-send'
import { backup_database } from './backup-database'
import { export_training_data } from './export-training-data'
import { index_now } from './index-now'
import { newsletter_send } from './newsletter-send'
import { pull_database } from './pull-database'
import { restore_database } from './restore-database'
import { update_embeddings } from './update-embeddings'
import { update_popular_posts } from './update-popular-posts'
import { update_posts } from './update-posts'
import { update_related_posts_table } from './update-related-posts'
import { update_stats } from './update-stats'

/**
 * === GETTING PRODUCTION DATA LOCALLY ===
 *
 * Step 1: Update production database with latest posts/stats
 *
for task in "update_popular_posts" "update_posts" "update_embeddings" "update_related_posts"; do
	curl -X POST https://scottspence.com/api/ingest \
		-H "Content-Type: application/json" \
		-d "{\"task\": \"$task\", \"token\": \"your-secret-token\"}"
	echo
done
 *
 * Step 2: Create a backup of production database
 *
curl -X POST https://scottspence.com/api/ingest \
	-H "Content-Type: application/json" \
	-d '{"task": "backup_database", "token": "your-secret-token"}'
 *
 * Step 3: Download the backup to local
 *
curl -H "Authorization: Bearer your-secret-token" \
		https://scottspence.com/api/ingest/download \
		-o data/site-data.db
 *
 * Step 4: Restart dev server to clear caches
 *
 * === RUNNING TASKS LOCALLY ===
 *
 * Update local database with latest posts/stats
 *
for task in "update_popular_posts" "update_posts" "update_embeddings" "update_related_posts"; do
	curl -X POST http://localhost:5173/api/ingest \
		-H "Content-Type: application/json" \
		-d "{\"task\": \"$task\", \"token\": \"your-secret-token\"}"
	echo
done
 *
 * === SINGLE TASK EXAMPLES ===
 *
 * Production:
 *
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "update_posts", "token": "your-secret-token"}'
 *
 * Localhost:
 *
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "update_posts", "token": "your-secret-token"}'
 */

// Define generic task function
type TaskFunction<TArgs = any, TResult = any> = (
	...args: TArgs[]
) => Promise<TResult>

// Define the type for the keys in tasks object
type TaskKey =
	| 'update_popular_posts'
	| 'update_posts'
	| 'update_embeddings'
	| 'update_related_posts'
	| 'index_now'
	| 'update_stats'
	| 'export_training_data'
	| 'backup_database'
	| 'pull_database'
	| 'restore_database'
	| 'newsletter_send'
	| 'adhoc_newsletter_send'

// Define the type for tasks object
interface TaskType {
	[key: string]: {
		function: TaskFunction
		expects_fetch: boolean
	}
}

// Define the type for the expected structure of request body
interface RequestBody {
	token: string
	task: TaskKey
}

// Define a mapping from task names to functions
const tasks: TaskType = {
	update_popular_posts: {
		function: update_popular_posts,
		expects_fetch: true,
	},
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
	update_stats: {
		function: update_stats,
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
	adhoc_newsletter_send: {
		function: adhoc_newsletter_send,
		expects_fetch: false,
	},
}

export const POST = async ({ request, fetch }) => {
	try {
		const body: RequestBody = await request.json()
		const token = body.token
		const task_key = body.task

		if (!token || token !== env.INGEST_TOKEN) {
			return json({ message: 'Unauthorized' }, { status: 401 })
		}

		const task = tasks[task_key]
		if (task && typeof task.function === 'function') {
			console.log(`Executing task: ${task_key}`)

			try {
				// Call the task function with or without fetch based on its requirement
				const result = task.expects_fetch
					? await task.function(fetch)
					: await task.function()

				console.log(`Task ${task_key} completed with result:`, result)
				return json(result)
			} catch (task_error) {
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
		} else {
			return json(
				{
					message:
						'Specified task does not exist or is not a function',
				},
				{ status: 400 },
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
