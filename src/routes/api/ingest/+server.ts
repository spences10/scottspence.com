import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import { index_now } from './index-now'
import { update_popular_posts } from './update-popular-posts'
import { update_posts } from './update-posts'

// curl -X POST https://yourdomain.com/api/ingest \
// -H "Content-Type: application/json" \
// -d '{"task": "task_name", "token": "your-secret-token"}'

// Define generic task function
type TaskFunction<TArgs = any, TResult = any> = (
	...args: TArgs[]
) => Promise<TResult>

// Define the type for the keys in tasks object
type TaskKey = 'update_popular_posts' | 'update_posts'

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

			// Call the task function with or without fetch based on its requirement
			const result = task.expects_fetch
				? await task.function(fetch)
				: await task.function()

			console.log(`Task ${task_key} completed with result:`, result)
			return json(result)
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
