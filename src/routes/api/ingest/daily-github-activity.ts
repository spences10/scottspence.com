import { NEWSLETTER_GH_ACTIVITY_TOKEN } from '$env/static/private'
import { insert_github_activity } from '$lib/newsletter/db-writer'
import { fetch_github_activity } from '$lib/newsletter/github-fetcher'

/**
 * Fetch and store yesterday's GitHub activity
 * Designed to be run daily via cron job
 */
export const daily_github_activity = async () => {
	try {
		console.log('Starting daily GitHub activity fetch...')

		const github_token = NEWSLETTER_GH_ACTIVITY_TOKEN
		if (!github_token) {
			throw new Error(
				'NEWSLETTER_GH_ACTIVITY_TOKEN environment variable is not set',
			)
		}

		// Calculate yesterday's date range
		const to = new Date()
		to.setHours(0, 0, 0, 0) // Start of today

		const from = new Date(to)
		from.setDate(from.getDate() - 1) // Start of yesterday

		const date_str = from.toISOString().split('T')[0]
		console.log(`Fetching GitHub activity for ${date_str}`)

		// Fetch GitHub activity for yesterday
		const activity = await fetch_github_activity(github_token, {
			from,
			to,
		})

		// Insert into database
		const results = insert_github_activity(activity)

		console.log('Daily GitHub activity fetch completed successfully')

		return {
			success: true,
			message: `GitHub activity for ${date_str} stored successfully`,
			data: {
				date: date_str,
				counts: results,
				activity_summary: {
					commits: activity.commits.length,
					pull_requests: activity.pull_requests.length,
					issues: activity.issues.length,
					releases: activity.releases.length,
				},
			},
		}
	} catch (error) {
		console.error('Error in daily_github_activity task:', error)
		throw error
	}
}
