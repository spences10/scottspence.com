import { NEWSLETTER_GH_ACTIVITY_TOKEN } from '$env/static/private'
import { fetch_github_activity as fetch_activity } from '$lib/newsletter/github-fetcher'

/**
 * Fetch GitHub activity for the authenticated user
 * Returns commits, PRs, issues, and releases from the last month
 */
export const fetch_github_activity = async () => {
	try {
		const github_token = NEWSLETTER_GH_ACTIVITY_TOKEN

		if (!github_token) {
			throw new Error(
				'NEWSLETTER_GH_ACTIVITY_TOKEN environment variable is not set. Please add it to your .env file.',
			)
		}

		console.log('Fetching GitHub activity...')
		const activity = await fetch_activity(github_token)

		return {
			success: true,
			data: activity,
			summary: {
				commits: activity.commits.length,
				pull_requests: activity.pull_requests.length,
				issues: activity.issues.length,
				releases: activity.releases.length,
				date_range: activity.date_range,
			},
		}
	} catch (error) {
		console.error('Error in fetch_github_activity task:', error)
		throw error
	}
}
