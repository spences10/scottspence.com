import Anthropic from '@anthropic-ai/sdk'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { read_agent_prompt } from './agent-reader'

const __dirname = dirname(fileURLToPath(import.meta.url))

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
})

interface MockData {
	month: string
	year: number
	bluesky_posts: Array<{
		text: string
		likes: number
		replies: number
		date: string
	}>
	github_activity: Array<{
		type: string
		repo: string
		commits?: number
		version?: string
		message: string
		date: string
	}>
}

/**
 * Generate mock data for testing
 * Replace with real Bluesky and GitHub API calls later
 */
function get_mock_data(): MockData {
	const now = new Date()
	const month = now.toLocaleString('en-GB', { month: 'long' })
	const year = now.getFullYear()

	return {
		month,
		year,
		bluesky_posts: [
			{
				text: 'Just shipped the new newsletter automation system. Finally getting those monthly updates out!',
				likes: 24,
				replies: 3,
				date: '2025-10-15',
			},
			{
				text: 'Spent the morning optimizing database queries. 60% faster now. Small wins add up.',
				likes: 18,
				replies: 2,
				date: '2025-10-10',
			},
		],
		github_activity: [
			{
				type: 'push',
				repo: 'scottspence.com',
				commits: 5,
				message: 'feat: implement newsletter generation workflow',
				date: '2025-10-17',
			},
			{
				type: 'release',
				repo: 'some-package',
				version: '1.2.0',
				message: 'Added new features',
				date: '2025-10-14',
			},
		],
	}
}

/**
 * Call Anthropic API to generate newsletter using agent prompt
 */
async function call_anthropic_api(
	agent_prompt: string,
	mock_data: MockData,
): Promise<string> {
	const user_message = `
Generate a newsletter draft for ${mock_data.month} ${mock_data.year} using this data:

## Bluesky Posts
${JSON.stringify(mock_data.bluesky_posts, null, 2)}

## GitHub Activity
${JSON.stringify(mock_data.github_activity, null, 2)}

Return ONLY the markdown content with frontmatter. Do NOT wrap in code fences or markdown triple backticks.
Start with the frontmatter (---) and include title, date, and published: false.
`

	console.log('Calling Anthropic API...')

	const message = await anthropic.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 2048,
		system: agent_prompt,
		messages: [
			{
				role: 'user',
				content: user_message,
			},
		],
	})

	const content = message.content[0]
	if (content.type !== 'text') {
		throw new Error('Unexpected response type from API')
	}

	return content.text
}

/**
 * Save generated newsletter to file
 */
function save_newsletter(content: string): string {
	const now = new Date()
	const filename = now.toISOString().slice(0, 7) // YYYY-MM format

	const newsletter_dir = join(__dirname, '../../content/newsletters')

	// Create directory if it doesn't exist
	if (!newsletter_dir) {
		mkdirSync(newsletter_dir, { recursive: true })
		console.log(`Created directory: ${newsletter_dir}`)
	}

	const filepath = join(newsletter_dir, `${filename}.md`)

	writeFileSync(filepath, content, 'utf-8')
	console.log(`Newsletter saved to: ${filepath}`)

	return filepath
}

/**
 * Main function: Generate newsletter and save to file
 */
export async function generate_newsletter(): Promise<void> {
	try {
		console.log('Starting newsletter generation...')

		const agent_prompt = read_agent_prompt()
		const mock_data = get_mock_data()
		const newsletter_content = await call_anthropic_api(
			agent_prompt,
			mock_data,
		)
		const filepath = save_newsletter(newsletter_content)

		console.log('Newsletter generation complete!')
		console.log(`File: ${filepath}`)
	} catch (error) {
		console.error('Newsletter generation failed:', error)
		throw error
	}
}
