import { update_posts } from '../src/routes/api/ingest/update-posts'

export default async function globalSetup() {
	console.log('Seeding database with posts...')
	const result = await update_posts()
	console.log(result.message)
}
