import { update_posts } from '../../src/routes/api/ingest/update-posts'

/**
 * Seed the database with posts from markdown files
 * Used in CI before running e2e tests
 */
const main = async () => {
	try {
		console.log('Seeding database with posts...')
		const result = await update_posts()
		console.log(result.message)
		process.exit(0)
	} catch (error) {
		console.error('Failed to seed database:', error)
		process.exit(1)
	}
}

main()
