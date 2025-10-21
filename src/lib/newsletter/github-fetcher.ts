import { Octokit } from '@octokit/rest'

export interface DateRange {
	from: Date
	to: Date
}

export interface GitHubCommit {
	repo: string
	message: string
	sha: string
	date: string
	url: string
	is_private: boolean
}

export interface GitHubPullRequest {
	repo: string
	title: string
	number: number
	state: string
	created_at: string
	merged_at: string | null
	url: string
	is_private: boolean
}

export interface GitHubIssue {
	repo: string
	title: string
	number: number
	state: string
	created_at: string
	closed_at: string | null
	url: string
	is_private: boolean
}

export interface GitHubRelease {
	repo: string
	tag_name: string
	name: string
	published_at: string
	url: string
	is_private: boolean
}

export interface GitHubActivity {
	commits: GitHubCommit[]
	pull_requests: GitHubPullRequest[]
	issues: GitHubIssue[]
	releases: GitHubRelease[]
	date_range: {
		from: string
		to: string
	}
}

/**
 * Get default date range (last month)
 */
function get_default_date_range(): DateRange {
	const to = new Date()
	const from = new Date()
	from.setMonth(from.getMonth() - 1)
	return { from, to }
}

/**
 * Fetch GitHub activity for the authenticated user using search API
 * Much faster than repo-by-repo iteration - uses GitHub's search across all repos
 */
export async function fetch_github_activity(
	token: string,
	date_range?: DateRange,
): Promise<GitHubActivity> {
	const octokit = new Octokit({ auth: token })

	const range = date_range || get_default_date_range()
	const from_iso = range.from.toISOString()
	const to_iso = range.to.toISOString()

	// Format dates for GitHub search (YYYY-MM-DD)
	const from_date = range.from.toISOString().split('T')[0]
	const to_date = range.to.toISOString().split('T')[0]

	console.log(
		`Fetching GitHub activity from ${from_iso} to ${to_iso}`,
	)

	// Get authenticated user info
	const { data: user } = await octokit.rest.users.getAuthenticated()
	const username = user.login

	console.log(`Fetching activity for user: ${username}`)

	const commits: GitHubCommit[] = []
	const pull_requests: GitHubPullRequest[] = []
	const issues: GitHubIssue[] = []
	const releases: GitHubRelease[] = []

	// Cache for repo privacy status (repo_full_name -> is_private)
	const repo_privacy_cache = new Map<string, boolean>()

	/**
	 * Get repository privacy status (with caching)
	 */
	const get_repo_privacy = async (
		repo_full_name: string,
	): Promise<boolean> => {
		if (repo_privacy_cache.has(repo_full_name)) {
			return repo_privacy_cache.get(repo_full_name)!
		}

		try {
			const [owner, repo] = repo_full_name.split('/')
			const { data } = await octokit.rest.repos.get({ owner, repo })
			repo_privacy_cache.set(repo_full_name, data.private)
			return data.private
		} catch (error) {
			// If we can't fetch repo details, assume public
			console.warn(
				`Could not fetch privacy for ${repo_full_name}:`,
				error,
			)
			repo_privacy_cache.set(repo_full_name, false)
			return false
		}
	}

	try {
		// Search commits across ALL repos (including orgs) - much faster!
		console.log('Searching commits...')
		const commit_query = `author:${username} author-date:${from_date}..${to_date}`
		const { data: commit_results } =
			await octokit.rest.search.commits({
				q: commit_query,
				per_page: 100,
				sort: 'author-date',
				order: 'desc',
			})

		for (const item of commit_results.items) {
			const repo_name = item.repository.full_name
			commits.push({
				repo: repo_name,
				message: item.commit.message,
				sha: item.sha,
				date: item.commit.author?.date || '',
				url: item.html_url,
				is_private: item.repository.private,
			})
			// Cache the privacy status
			repo_privacy_cache.set(repo_name, item.repository.private)
		}
		console.log(`Found ${commits.length} commits`)

		// Search PRs across ALL repos
		console.log('Searching pull requests...')
		const pr_query = `author:${username} created:${from_date}..${to_date} is:pr`
		const pr_response = await octokit.request('GET /search/issues', {
			q: pr_query,
			per_page: 100,
			sort: 'created',
			order: 'desc',
			advanced_search: true,
		})
		const pr_results = pr_response.data

		for (const item of pr_results.items) {
			// Extract repo name from URL
			const repo_match = item.repository_url.match(/repos\/(.+)$/)
			const repo_name = repo_match ? repo_match[1] : 'unknown'

			// Fetch repo privacy if not already cached
			const is_private = await get_repo_privacy(repo_name)

			pull_requests.push({
				repo: repo_name,
				title: item.title,
				number: item.number,
				state: item.state,
				created_at: item.created_at,
				merged_at: item.pull_request?.merged_at || null,
				url: item.html_url,
				is_private,
			})
		}
		console.log(`Found ${pull_requests.length} pull requests`)

		// Search issues across ALL repos (excluding PRs)
		console.log('Searching issues...')
		const issue_query = `author:${username} created:${from_date}..${to_date} is:issue`
		const issue_response = await octokit.request(
			'GET /search/issues',
			{
				q: issue_query,
				per_page: 100,
				sort: 'created',
				order: 'desc',
				advanced_search: true,
			},
		)
		const issue_results = issue_response.data

		for (const item of issue_results.items) {
			// Extract repo name from URL
			const repo_match = item.repository_url.match(/repos\/(.+)$/)
			const repo_name = repo_match ? repo_match[1] : 'unknown'

			// Fetch repo privacy if not already cached
			const is_private = await get_repo_privacy(repo_name)

			issues.push({
				repo: repo_name,
				title: item.title,
				number: item.number,
				state: item.state,
				created_at: item.created_at,
				closed_at: item.closed_at,
				url: item.html_url,
				is_private,
			})
		}
		console.log(`Found ${issues.length} issues`)

		// For releases, only fetch from owned repos (can't release to others' repos)
		console.log('Fetching releases from owned repos...')
		const { data: repos } =
			await octokit.rest.repos.listForAuthenticatedUser({
				sort: 'updated',
				per_page: 100,
			})

		for (const repo of repos) {
			try {
				const { data: repo_releases } =
					await octokit.rest.repos.listReleases({
						owner: repo.owner.login,
						repo: repo.name,
						per_page: 100,
					})

				// Cache repo privacy
				repo_privacy_cache.set(repo.full_name, repo.private)

				for (const release of repo_releases) {
					if (!release.published_at) continue

					const published = new Date(release.published_at)
					if (published < range.from || published > range.to) continue

					releases.push({
						repo: repo.full_name,
						tag_name: release.tag_name,
						name: release.name || release.tag_name,
						published_at: release.published_at,
						url: release.html_url,
						is_private: repo.private,
					})
				}
			} catch (error) {
				// Continue with other repos if one fails
				console.error(
					`Error fetching releases for ${repo.full_name}:`,
					error,
				)
			}
		}
		console.log(`Found ${releases.length} releases`)
	} catch (error) {
		console.error('Error fetching GitHub activity:', error)
		throw error
	}

	console.log(
		`Total: ${commits.length} commits, ${pull_requests.length} PRs, ${issues.length} issues, ${releases.length} releases`,
	)

	return {
		commits,
		pull_requests,
		issues,
		releases,
		date_range: {
			from: from_iso,
			to: to_iso,
		},
	}
}
