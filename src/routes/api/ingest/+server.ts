import { json } from '@sveltejs/kit'

// curl -X POST https://scottspence.com/api/ingest -H "Content-Type: application/json" -d '{}'

export const POST = async ({ request }) => {
  console.log('=====================')
  console.log({ request })
  console.log('=====================')
  return json({ message: 'Background task started' })
}
