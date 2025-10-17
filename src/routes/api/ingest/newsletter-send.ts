import { send_newsletter } from '$lib/newsletter/sender'

/**
 * Send newsletter for current month
 * Automatically generates filename based on current date (YYYY-MM.md)
 * Only sends if newsletter is marked as published in frontmatter
 */
export const newsletter_send = async () => {
	try {
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const filename = `${year}-${month}.md`

		console.log(`Sending newsletter for: ${filename}`)
		return await send_newsletter(filename)
	} catch (error) {
		console.error('Error in newsletter_send task:', error)
		throw error
	}
}
