import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import { update_popular_posts } from './popular-posts'
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
  update_popular_posts: TaskFunction
  update_posts: TaskFunction
}

// Define the type for the expected structure of request body
interface RequestBody {
  token: string
  task: TaskKey
}

// Define a mapping from task names to functions
const tasks: TaskType = {
  update_popular_posts,
  update_posts,
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
    if (task && typeof tasks[task] === 'function') {
      console.log(`Executing task: ${task}`)
      const result = await tasks[task]()
      console.log(`Task ${task} completed with result:`, result)
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
    return json(
      {
        message: 'Error processing the request',
        error: JSON.stringify(error, null, 2),
      },
      { status: 500 },
    )
  }
}
