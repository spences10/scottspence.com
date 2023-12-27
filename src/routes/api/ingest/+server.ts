import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

// curl -X POST https://yourdomain.com/api/ingest \
// -H "Content-Type: application/json" \
// -d '{"token": "your-secret-token"}'

export const POST = async ({ request }) => {
  // Parse the request body as JSON
  const body = await request.json()

  // Extract the token from the request body
  const token = body.token

  // Check if the provided token matches your secret token
  if (!token || token !== env.INGEST_TOKEN) {
    return json({ message: 'Unauthorized' }, { status: 401 })
  }

  // Check if the provided token matches your secret token
  if (token !== env.INGEST_TOKEN) {
    return json({ message: 'Unauthorized' }, { status: 401 })
  }
  
  console.log('=====================')
  console.log({ request })
  console.log('=====================')
  return json({ message: 'Background task started' })
}
