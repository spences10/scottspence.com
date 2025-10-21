import { sqlite_client } from '$lib/sqlite/client'
import type {
	GitHubActivity,
	GitHubCommit,
	GitHubIssue,
	GitHubPullRequest,
	GitHubRelease,
} from './github-fetcher'

/**
 * Insert GitHub commits into database
 * Uses INSERT OR REPLACE to handle duplicates (UNIQUE constraint on sha)
 */
export function insert_commits(commits: GitHubCommit[]): number {
	if (commits.length === 0) return 0

	const queries = commits.map((commit) => ({
		sql: `
			INSERT OR REPLACE INTO github_commits
			(sha, repo, message, date, url, is_private, fetched_at)
			VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`,
		args: [
			commit.sha,
			commit.repo,
			commit.message,
			commit.date,
			commit.url,
			commit.is_private ? 1 : 0,
		],
	}))

	sqlite_client.batch(queries)
	console.log(`Inserted ${commits.length} commits`)
	return commits.length
}

/**
 * Insert GitHub pull requests into database
 * Uses INSERT OR REPLACE to handle duplicates (UNIQUE constraint on repo+number)
 */
export function insert_pull_requests(
	pull_requests: GitHubPullRequest[],
): number {
	if (pull_requests.length === 0) return 0

	const queries = pull_requests.map((pr) => ({
		sql: `
			INSERT OR REPLACE INTO github_pull_requests
			(repo, number, title, state, created_at, merged_at, url, is_private, fetched_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`,
		args: [
			pr.repo,
			pr.number,
			pr.title,
			pr.state,
			pr.created_at,
			pr.merged_at,
			pr.url,
			pr.is_private ? 1 : 0,
		],
	}))

	sqlite_client.batch(queries)
	console.log(`Inserted ${pull_requests.length} pull requests`)
	return pull_requests.length
}

/**
 * Insert GitHub issues into database
 * Uses INSERT OR REPLACE to handle duplicates (UNIQUE constraint on repo+number)
 */
export function insert_issues(issues: GitHubIssue[]): number {
	if (issues.length === 0) return 0

	const queries = issues.map((issue) => ({
		sql: `
			INSERT OR REPLACE INTO github_issues
			(repo, number, title, state, created_at, closed_at, url, is_private, fetched_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`,
		args: [
			issue.repo,
			issue.number,
			issue.title,
			issue.state,
			issue.created_at,
			issue.closed_at,
			issue.url,
			issue.is_private ? 1 : 0,
		],
	}))

	sqlite_client.batch(queries)
	console.log(`Inserted ${issues.length} issues`)
	return issues.length
}

/**
 * Insert GitHub releases into database
 * Uses INSERT OR REPLACE to handle duplicates (UNIQUE constraint on repo+tag_name)
 */
export function insert_releases(releases: GitHubRelease[]): number {
	if (releases.length === 0) return 0

	const queries = releases.map((release) => ({
		sql: `
			INSERT OR REPLACE INTO github_releases
			(repo, tag_name, name, published_at, url, is_private, fetched_at)
			VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`,
		args: [
			release.repo,
			release.tag_name,
			release.name,
			release.published_at,
			release.url,
			release.is_private ? 1 : 0,
		],
	}))

	sqlite_client.batch(queries)
	console.log(`Inserted ${releases.length} releases`)
	return releases.length
}

/**
 * Insert all GitHub activity into database
 * Convenience function that inserts commits, PRs, issues, and releases
 */
export function insert_github_activity(activity: GitHubActivity): {
	commits: number
	pull_requests: number
	issues: number
	releases: number
} {
	console.log('Inserting GitHub activity into database...')

	const results = {
		commits: insert_commits(activity.commits),
		pull_requests: insert_pull_requests(activity.pull_requests),
		issues: insert_issues(activity.issues),
		releases: insert_releases(activity.releases),
	}

	console.log('GitHub activity insertion complete:', results)
	return results
}
