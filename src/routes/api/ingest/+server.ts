import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import { update_popular_posts } from './popular-posts.js'

// curl -X POST https://yourdomain.com/api/ingest \
// -H "Content-Type: application/json" \
// -d '{"task": "task_name", "token": "your-secret-token"}'

// Define generic task function
type TaskFunction<TArgs = any, TResult = any> = (
  ...args: TArgs[]
) => Promise<TResult>

// Define the type for the keys in tasks object
type TaskKey = 'update_popular_posts' | 'additional_task'

// Define the type for tasks object
interface TaskType {
  [key: string]: TaskFunction | undefined
}

// Define the type for the expected structure of request body
interface RequestBody {
  token: string
  task: TaskKey
}

// Define a mapping from task names to functions
const tasks: TaskType = {
  update_popular_posts,
}

export const POST = async ({ request }) => {
  try {
    const body: RequestBody = await request.json()

    const token = body.token
    const task = body.task

    // Check if the provided token matches your secret token
    if (!token || token !== env.INGEST_TOKEN) {
      return json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if the task is in the mapping object
    if (task && tasks[task]) {
      return json(tasks[task])
    } else {
      return json(
        { message: 'Task not specified or unknown' },
        { status: 400 },
      )
    }
  } catch (error) {
    return json(
      {
        message: 'Error processing the request',
        error: JSON.stringify(error, null, 2),
      },
      { status: 500 },
    )
  }
}
