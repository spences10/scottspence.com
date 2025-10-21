import { ANTHROPIC_API_KEY } from '$env/static/private'
import Anthropic from '@anthropic-ai/sdk'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { read_agent_prompt } from './agent-reader'
import { fetch_github_activity_from_db } from './db-fetcher'
import type { GitHubActivity } from './github-fetcher'
import { fetch_blog_posts, type BlogPost } from './posts-fetcher'

const __dirname = dirname(fileURLToPath(import.meta.url))

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY,
})

interface NewsletterData {
	month: string
	year: number
	github_activity: GitHubActivity
	blog_posts: BlogPost[]
}

/**
 * Fetch real data for newsletter from database
 */
async function fetch_newsletter_data(): Promise<NewsletterData> {
	const now = new Date()
	const month = now.toLocaleString('en-GB', { month: 'long' })
	const year = now.getFullYear()

	console.log('Fetching GitHub activity from database...')
	const github_activity = await fetch_github_activity_from_db()

	console.log('Fetching blog posts from database...')
	const blog_posts = await fetch_blog_posts()

	return {
		month,
		year,
		github_activity,
		blog_posts,
	}
}

/**
 * Call Anthropic API to generate newsletter using agent prompt
 */
async function call_anthropic_api(
	agent_prompt: string,
	data: NewsletterData,
): Promise<string> {
	const { month, year, github_activity, blog_posts } = data

	// Format GitHub activity for better readability
	const activity_summary = `
### Summary
- **Commits**: ${github_activity.commits.length} commits across ${new Set(github_activity.commits.map((c) => c.repo)).size} repositories
- **Pull Requests**: ${github_activity.pull_requests.length} PRs (${github_activity.pull_requests.filter((pr) => pr.merged_at).length} merged)
- **Issues**: ${github_activity.issues.length} issues
- **Releases**: ${github_activity.releases.length} releases
- **Blog Posts**: ${blog_posts.length} posts published

### Date Range
From: ${github_activity.date_range.from}
To: ${github_activity.date_range.to}
`

	const user_message = `
Generate a newsletter draft for ${month} ${year} using this data:

${activity_summary}

## Blog Posts
${JSON.stringify(blog_posts, null, 2)}

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

	const newsletter_dir = join(__dirname, '../../../newsletter')

	// Create directory if it doesn't exist
	mkdirSync(newsletter_dir, { recursive: true })
	console.log(`Created directory: ${newsletter_dir}`)

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

		const agent_prompt = read_agent_prompt()
		const newsletter_data = await fetch_newsletter_data()
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
