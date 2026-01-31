import { NEWSLETTER_GH_ACTIVITY_TOKEN } from '$env/static/private'
import { insert_github_activity } from '$lib/newsletter/db-writer'
import { fetch_github_activity } from '$lib/newsletter/github-fetcher'

/**
 * Backfill GitHub activity for October 2025
 * Hardcoded dates: 2025-10-01 through 2025-10-20
 */
export const backfill_github_activity = async () => {
	try {
		console.log('Starting GitHub activity backfill...')

		const github_token = NEWSLETTER_GH_ACTIVITY_TOKEN
		if (!github_token) {
			throw new Error(
				'NEWSLETTER_GH_ACTIVITY_TOKEN environment variable is not set',
			)
		}

		// Hardcoded date range
		const from_date = '2026-01-19'
		const to_date = '2026-01-31'

		console.log(`Backfill date range: ${from_date} to ${to_date}`)

		// Generate array of dates
		const start = new Date(from_date)
		const end = new Date(to_date)
		const dates: Date[] = []

		const current = new Date(start)
		while (current <= end) {
			dates.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}

		console.log(`Processing ${dates.length} days...`)

		let total_commits = 0
		let total_prs = 0
		let total_issues = 0
		let total_releases = 0

		for (let i = 0; i < dates.length; i++) {
			const current_date = dates[i]
			const next_date = new Date(current_date)
			next_date.setDate(next_date.getDate() + 1)

			const date_str = current_date.toISOString().split('T')[0]
			console.log(
				`[${i + 1}/${dates.length}] Fetching ${date_str}...`,
			)

			try {
				// Fetch activity for this single day
				const activity = await fetch_github_activity(github_token, {
					from: current_date,
					to: next_date,
				})

				// Insert into database
				const results = insert_github_activity(activity)

				total_commits += results.commits
				total_prs += results.pull_requests
				total_issues += results.issues
				total_releases += results.releases

				console.log(
					`  ✓ Commits: ${results.commits}, PRs: ${results.pull_requests}, Issues: ${results.issues}, Releases: ${results.releases}`,
				)
			} catch (error) {
				console.error(`  ✗ Error fetching ${date_str}:`, error)
				// Continue with next day
			}
		}

		console.log('Backfill complete!')

		return {
			success: true,
			message: `GitHub activity backfilled for ${from_date} to ${to_date}`,
			data: {
				date_range: {
					from: from_date,
					to: to_date,
				},
				days_processed: dates.length,
				totals: {
					commits: total_commits,
					pull_requests: total_prs,
					issues: total_issues,
					releases: total_releases,
				},
			},
		}
	} catch (error) {
		console.error('Error in backfill_github_activity task:', error)
		throw error
	}
}
