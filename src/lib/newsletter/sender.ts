import { env } from '$env/dynamic/private'
import { sqlite_client } from '$lib/sqlite/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { convert_newsletter_to_html } from './html-converter'

interface SendResult {
	success: boolean
	message: string
	broadcast_id?: string
}

interface NewsletterFile {
	filename: string
	content: string
}

/**
 * Read newsletter file from disk
 */
function read_newsletter_file(filename: string): NewsletterFile {
	// Validate filename to prevent path traversal
	if (!filename.match(/^\d{4}-\d{2}\.md$/)) {
		throw new Error('Invalid filename format. Use YYYY-MM.md')
	}

	try {
		// Try reading from src first (for development)
		const src_path = join(
			process.cwd(),
			'src/content/newsletters',
			filename,
		)
		const content = readFileSync(src_path, 'utf-8')
		return { filename, content }
	} catch {
		throw new Error(`Newsletter file not found: ${filename}`)
	}
}

/**
 * Check if newsletter has already been sent
 */
async function has_been_sent(filename: string): Promise<boolean> {
	try {
		const result = await sqlite_client.execute({
			sql: 'SELECT id FROM newsletters_sent WHERE filename = ?;',
			args: [filename],
		})
		return result.rows.length > 0
	} catch (error) {
		console.error('Error checking send status:', error)
		return false
	}
}

/**
 * Send newsletter via Resend broadcast API
 */
async function send_via_resend(
	html: string,
	title: string,
): Promise<string> {
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: `Scott <${env.RESEND_FROM_EMAIL}>`,
			to: env.RESEND_AUDIENCE_ID,
			subject: title,
			html,
			headers: {
				'List-Unsubscribe': '{unsubscribe_link}',
			},
		}),
	})

	if (!response.ok) {
		const error_data = await response.json()
		throw new Error(
			error_data.message || 'Failed to send newsletter via Resend',
		)
	}

	const data = await response.json()
	return data.id
}

/**
 * Record newsletter send in database
 */
async function record_send(
	filename: string,
	broadcast_id: string,
	subscriber_count: number,
): Promise<void> {
	try {
		await sqlite_client.execute({
			sql: `
        INSERT INTO newsletters_sent (filename, resend_broadcast_id, subscriber_count)
        VALUES (?, ?, ?);
      `,
			args: [filename, broadcast_id, subscriber_count],
		})
	} catch (error) {
		console.error('Error recording newsletter send:', error)
		throw new Error('Failed to record newsletter send')
	}
}

/**
 * Get subscriber count for tracking
 */
async function get_subscriber_count(): Promise<number> {
	try {
		const response = await fetch(
			`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts?limit=1`,
			{
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
				},
			},
		)

		if (!response.ok) {
			throw new Error('Failed to fetch subscriber count')
		}

		const data = await response.json()
		// The API returns pagination metadata, count total contacts by fetching all pages
		let total_count = 0
		let has_more = true
		let after_cursor: string | undefined

		// First fetch (already done above, just set the count)
		if (data.data) {
			total_count = data.data.length
			has_more = data.has_more
			if (data.data.length > 0) {
				after_cursor = data.data[data.data.length - 1].id
			}
		}

		// Fetch remaining pages if needed
		while (has_more && after_cursor) {
			const next_response = await fetch(
				`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts?limit=100&after=${after_cursor}`,
				{
					headers: {
						Authorization: `Bearer ${env.RESEND_API_KEY}`,
					},
				},
			)

			if (!next_response.ok) break

			const next_data = await next_response.json()
			total_count += next_data.data?.length || 0
			has_more = next_data.has_more || false

			if (next_data.data && next_data.data.length > 0) {
				after_cursor = next_data.data[next_data.data.length - 1].id
			} else {
				break
			}
		}

		return total_count
	} catch (error) {
		console.error('Error fetching subscriber count:', error)
		return 0
	}
}

/**
 * Send newsletter to subscribers
 */
export async function send_newsletter(
	filename: string,
): Promise<SendResult> {
	try {
		// Check if already sent
		const already_sent = await has_been_sent(filename)
		if (already_sent) {
			return {
				success: false,
				message: 'Newsletter has already been sent',
			}
		}

		// Read newsletter file
		const { content } = read_newsletter_file(filename)

		// Convert to HTML
		const { html, title, published } =
			await convert_newsletter_to_html(content)

		if (!published) {
			return {
				success: false,
				message: 'Newsletter is not published (published: false)',
			}
		}

		// Get subscriber count
		const subscriber_count = await get_subscriber_count()

		// Send via Resend
		console.log(
			`Sending newsletter: ${filename} to ${subscriber_count} subscribers`,
		)
		const broadcast_id = await send_via_resend(html, title)

		// Record send
		await record_send(filename, broadcast_id, subscriber_count)

		return {
			success: true,
			message: `Newsletter sent to ${subscriber_count} subscribers`,
			broadcast_id,
		}
	} catch (error) {
		const error_message =
			error instanceof Error ? error.message : 'Unknown error'
		console.error('Newsletter send failed:', error_message)
		return {
			success: false,
			message: error_message,
		}
	}
}
