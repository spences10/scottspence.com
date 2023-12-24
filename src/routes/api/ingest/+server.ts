import { json } from '@sveltejs/kit'

export const POST = async ({ request }) => {
  console.log('=====================')
  console.log({ request })
  console.log('=====================')
  return json({ message: 'Background task started' })
}
