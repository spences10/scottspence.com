import { send_newsletter } from '$lib/newsletter/sender'
import { sqlite_client } from '$lib/sqlite/client'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Parse frontmatter to extract published field
 */
function parse_frontmatter(content: string): { published?: boolean } {
	const match = content.match(/^---\n([\s\S]*?)\n---/)
	if (!match) return {}

	const fm = match[1]
	const published = fm.includes('published: true')
	return { published }
}

/**
 * Get set of already-sent newsletter filenames
 */
async function get_sent_newsletters(): Promise<Set<string>> {
	try {
		const result = await sqlite_client.execute(
			'SELECT filename FROM newsletters_sent',
		)
		return new Set(
			result.rows.map(
				(row) => (row as { filename: string }).filename,
			),
		)
	} catch (error) {
		console.error('Error fetching sent newsletters:', error)
		return new Set()
	}
}

/**
 * Find all unsent newsletters with published: true in frontmatter
 */
async function find_unsent_newsletters(): Promise<string[]> {
	const newsletters_dir = 'newsletter'
	const sent_files = await get_sent_newsletters()
	const unsent: string[] = []

	try {
		const files = readdirSync(newsletters_dir)
			.filter((f) => f.endsWith('.md'))
			.sort()

		for (const file of files) {
			if (sent_files.has(file)) continue

			const content = readFileSync(
				join(newsletters_dir, file),
				'utf-8',
			)
			const fm = parse_frontmatter(content)

			if (fm.published) {
				unsent.push(file)
			}
		}
	} catch (error) {
		console.error('Error scanning newsletters directory:', error)
		throw new Error('Failed to scan newsletters directory')
	}

	return unsent
}

/**
 * Send ad-hoc newsletter by auto-discovering unsent published newsletter
 */
export const adhoc_newsletter_send = async () => {
	const unsent = await find_unsent_newsletters()

	if (unsent.length === 0) {
		throw new Error('No unsent newsletters found')
	}

	if (unsent.length > 1) {
		throw new Error(
			`Multiple unsent newsletters found: ${unsent.join(', ')}. ` +
				'Please send or unpublish one manually.',
		)
	}

	console.log(`Sending ad-hoc newsletter: ${unsent[0]}`)
	return await send_newsletter(unsent[0])
}
