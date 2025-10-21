import { sqlite_client } from '$lib/sqlite/client'
import type {
	DateRange,
	GitHubActivity,
	GitHubCommit,
	GitHubIssue,
	GitHubPullRequest,
	GitHubRelease,
} from './github-fetcher'

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
 * Fetch GitHub commits from database for given date range
 */
function fetch_commits_from_db(
	from_iso: string,
	to_iso: string,
): GitHubCommit[] {
	const result = sqlite_client.execute({
		sql: `
			SELECT sha, repo, message, date, url, is_private
			FROM github_commits
			WHERE date >= ? AND date < ?
			ORDER BY date DESC
		`,
		args: [from_iso, to_iso],
	})

	return result.rows.map((row) => ({
		sha: row.sha as string,
		repo: row.repo as string,
		message: row.message as string,
		date: row.date as string,
		url: row.url as string,
		is_private: Boolean(row.is_private),
	}))
}

/**
 * Fetch GitHub pull requests from database for given date range
 */
function fetch_pull_requests_from_db(
	from_iso: string,
	to_iso: string,
): GitHubPullRequest[] {
	const result = sqlite_client.execute({
		sql: `
			SELECT repo, number, title, state, created_at, merged_at, url, is_private
			FROM github_pull_requests
			WHERE created_at >= ? AND created_at < ?
			ORDER BY created_at DESC
		`,
		args: [from_iso, to_iso],
	})

	return result.rows.map((row) => ({
		repo: row.repo as string,
		number: row.number as number,
		title: row.title as string,
		state: row.state as string,
		created_at: row.created_at as string,
		merged_at: (row.merged_at as string | null) || null,
		url: row.url as string,
		is_private: Boolean(row.is_private),
	}))
}

/**
 * Fetch GitHub issues from database for given date range
 */
function fetch_issues_from_db(
	from_iso: string,
	to_iso: string,
): GitHubIssue[] {
	const result = sqlite_client.execute({
		sql: `
			SELECT repo, number, title, state, created_at, closed_at, url, is_private
			FROM github_issues
			WHERE created_at >= ? AND created_at < ?
			ORDER BY created_at DESC
		`,
		args: [from_iso, to_iso],
	})

	return result.rows.map((row) => ({
		repo: row.repo as string,
		number: row.number as number,
		title: row.title as string,
		state: row.state as string,
		created_at: row.created_at as string,
		closed_at: (row.closed_at as string | null) || null,
		url: row.url as string,
		is_private: Boolean(row.is_private),
	}))
}

/**
 * Fetch GitHub releases from database for given date range
 */
function fetch_releases_from_db(
	from_iso: string,
	to_iso: string,
): GitHubRelease[] {
	const result = sqlite_client.execute({
		sql: `
			SELECT repo, tag_name, name, published_at, url, is_private
			FROM github_releases
			WHERE published_at >= ? AND published_at < ?
			ORDER BY published_at DESC
		`,
		args: [from_iso, to_iso],
	})

	return result.rows.map((row) => ({
		repo: row.repo as string,
		tag_name: row.tag_name as string,
		name: row.name as string,
		published_at: row.published_at as string,
		url: row.url as string,
		is_private: Boolean(row.is_private),
	}))
}

/**
 * Fetch GitHub activity from database for given date range
 * Returns the same interface as fetch_github_activity from github-fetcher
 * This is a drop-in replacement that uses local database instead of GitHub API
 */
export async function fetch_github_activity_from_db(
	date_range?: DateRange,
): Promise<GitHubActivity> {
	const range = date_range || get_default_date_range()
	const from_iso = range.from.toISOString()
	const to_iso = range.to.toISOString()

	console.log(
		`Fetching GitHub activity from database: ${from_iso} to ${to_iso}`,
	)

	const commits = fetch_commits_from_db(from_iso, to_iso)
	const pull_requests = fetch_pull_requests_from_db(from_iso, to_iso)
	const issues = fetch_issues_from_db(from_iso, to_iso)
	const releases = fetch_releases_from_db(from_iso, to_iso)

	console.log(
		`Found: ${commits.length} commits, ${pull_requests.length} PRs, ${issues.length} issues, ${releases.length} releases`,
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
