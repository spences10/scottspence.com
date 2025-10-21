import {
	ANTHROPIC_API_KEY,
	NEWSLETTER_GH_ACTIVITY_TOKEN,
} from '$env/static/private'
import Anthropic from '@anthropic-ai/sdk'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { read_agent_prompt } from './agent-reader'
import {
	fetch_github_activity,
	type GitHubActivity,
} from './github-fetcher'

const __dirname = dirname(fileURLToPath(import.meta.url))

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY,
})

interface NewsletterData {
	month: string
	year: number
	github_activity: GitHubActivity
}

/**
 * Fetch real data for newsletter
 */
async function fetch_newsletter_data(
	github_token: string,
): Promise<NewsletterData> {
	const now = new Date()
	const month = now.toLocaleString('en-GB', { month: 'long' })
	const year = now.getFullYear()

	console.log('Fetching GitHub activity...')
	const github_activity = await fetch_github_activity(github_token)

	return {
		month,
		year,
		github_activity,
	}
}

/**
 * Call Anthropic API to generate newsletter using agent prompt
 */
async function call_anthropic_api(
	agent_prompt: string,
	data: NewsletterData,
): Promise<string> {
	const { month, year, github_activity } = data

	// Format GitHub activity for better readability
	const activity_summary = `
### Summary
- **Commits**: ${github_activity.commits.length} commits across ${new Set(github_activity.commits.map((c) => c.repo)).size} repositories
- **Pull Requests**: ${github_activity.pull_requests.length} PRs (${github_activity.pull_requests.filter((pr) => pr.merged_at).length} merged)
- **Issues**: ${github_activity.issues.length} issues
- **Releases**: ${github_activity.releases.length} releases

### Date Range
From: ${github_activity.date_range.from}
To: ${github_activity.date_range.to}
`

	const user_message = `
Generate a newsletter draft for ${month} ${year} using this GitHub activity data:

${activity_summary}

## Commits
${JSON.stringify(github_activity.commits, null, 2)}

## Pull Requests
${JSON.stringify(github_activity.pull_requests, null, 2)}

## Issues
${JSON.stringify(github_activity.issues, null, 2)}

## Releases
${JSON.stringify(github_activity.releases, null, 2)}

Return ONLY the markdown content with frontmatter. Do NOT wrap in code fences or markdown triple backticks.
Start with the frontmatter (---) and include title, date, and published: false.
`

	console.log('Calling Anthropic API...')

	const message = await anthropic.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 4096, // Increased for larger content
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

export interface GenerateNewsletterResult {
	success: boolean
	filepath: string
	content: string
	filename: string
}

/**
 * Main function: Generate newsletter and save to file
 * Returns both the content and metadata for API responses
 */
export async function generate_newsletter(): Promise<GenerateNewsletterResult> {
	try {
		console.log('Starting newsletter generation...')

		// Check for required environment variables
		const github_token = NEWSLETTER_GH_ACTIVITY_TOKEN
		if (!github_token) {
			throw new Error(
				'NEWSLETTER_GH_ACTIVITY_TOKEN environment variable is required. Please add it to your .env file.',
			)
		}

		const agent_prompt = read_agent_prompt()
		const newsletter_data = await fetch_newsletter_data(github_token)
		const newsletter_content = await call_anthropic_api(
			agent_prompt,
			newsletter_data,
		)
		const filepath = save_newsletter(newsletter_content)

		const now = new Date()
		const filename = now.toISOString().slice(0, 7) // YYYY-MM format

		console.log('Newsletter generation complete!')
		console.log(`File: ${filepath}`)

		return {
			success: true,
			filepath,
			content: newsletter_content,
			filename: `${filename}.md`,
		}
	} catch (error) {
		console.error('Newsletter generation failed:', error)
		throw error
	}
}
