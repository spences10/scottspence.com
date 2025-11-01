import Database from 'better-sqlite3'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import * as sqliteVec from 'sqlite-vec'

export default async function global_setup() {
	console.log('Seeding database with posts...')

	// Create database
	const db_path = path.join(process.cwd(), 'data', 'site-data.db')
	const db = new Database(db_path)

	// Load sqlite-vec extension
	try {
		sqliteVec.load(db)
		console.log('sqlite-vec extension loaded')
	} catch (error) {
		console.warn('Failed to load sqlite-vec extension:', error)
	}

	// Read schema
	const schema = readFileSync(
		path.join(process.cwd(), 'src/lib/sqlite/schema.sql'),
		'utf-8',
	)
	db.exec(schema)

	// Read all markdown files
	const posts_dir = path.join(process.cwd(), 'posts')
	const post_files = readdirSync(posts_dir).filter((f) =>
		f.endsWith('.md'),
	)

	console.log(`Found ${post_files.length} posts to seed`)

	// Insert posts - minimal data for e2e tests
	const insert_post = db.prepare(`
		INSERT INTO posts (slug, title, date, is_private, preview, tags, reading_time_minutes, reading_time_text, reading_time_seconds, reading_time_words, preview_html, last_updated)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (slug) DO NOTHING
	`)

	// Insert embeddings into the virtual table
	const insert_embedding = db.prepare(`
		INSERT INTO post_embeddings (post_id, embedding)
		VALUES (?, ?)
	`)

	// Dummy embedding (1024 dimensions of zeros as JSON)
	const dummy_embedding = JSON.stringify(new Array(1024).fill(0))

	for (const file of post_files) {
		const slug = file.replace('.md', '')
		// Insert post
		insert_post.run(
			slug,
			slug.replace(/-/g, ' '), // title
			new Date().toISOString(), // date
			0, // is_private
			'Test preview', // preview
			'test,tag', // tags
			5, // reading_time_minutes
			'5 min read', // reading_time_text
			300, // reading_time_seconds
			1000, // reading_time_words
			'<p>Test preview</p>', // preview_html
			new Date().toISOString(), // last_updated
		)
		// Insert embedding
		insert_embedding.run(slug, dummy_embedding)
	}

	db.close()
	console.log(`Seeded ${post_files.length} posts`)
}
