import {
	RESEND_API_KEY,
	RESEND_FROM_EMAIL,
} from '$env/static/private'

/**
 * Send newsletter reminder email
 * Triggered by cron from ping-the-thing
 */
export const send_newsletter_reminder = async () => {
	try {
		const now = new Date()
		const month = now.toLocaleDateString('en-GB', {
			month: 'long',
			year: 'numeric',
		})

		console.log(`Sending newsletter reminder for ${month}...`)

		const email_response = await fetch(
			'https://api.resend.com/emails',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: `Newsletter Reminder <${RESEND_FROM_EMAIL}>`,
					to: ['yo@scottspence.dev'],
					subject: `📬 Newsletter Reminder: ${month}`,
					html: `
						<h2>Time to generate your newsletter!</h2>
						<p>It's the 28th - time to generate this month's newsletter for <strong>${month}</strong>.</p>

						<h3>Steps:</h3>
						<ol>
							<li>Start your dev server: <code>pnpm dev</code></li>
							<li>Run the generation command:</li>
						</ol>

						<pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">curl -X POST http://localhost:5173/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"task": "generate_newsletter", "token": "your-token"}'</pre>

						<p>This will create <code>newsletter/${now.toISOString().slice(0, 7)}.md</code></p>

						<h3>Then:</h3>
						<ul>
							<li>Review and edit the generated content</li>
							<li>Set <code>published: true</code> in the frontmatter</li>
							<li>Commit and push</li>
							<li>Send with <code>newsletter_send</code> task</li>
						</ul>

						<p style="color: #666; font-size: 0.9em; margin-top: 20px;">
							Automated reminder from ping-the-thing
						</p>
					`,
				}),
			},
		)

		if (!email_response.ok) {
			const error_data = await email_response.json()
			throw new Error(
				error_data.message || 'Failed to send reminder email',
			)
		}

		const result = await email_response.json()

		console.log(`Newsletter reminder sent successfully: ${result.id}`)

		return {
			success: true,
			message: `Newsletter reminder sent for ${month}`,
			email_id: result.id,
		}
	} catch (error) {
		console.error('Error sending newsletter reminder:', error)
		throw error
	}
}
