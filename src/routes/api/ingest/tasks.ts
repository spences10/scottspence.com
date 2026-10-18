import {
	get_task_log_store,
	run_logged_task,
	type TaskRunOptions,
} from '#lib/server/task-logs.js';
import {
	query_task_logs,
	validate_query_task_logs,
} from './query-task-logs';
import { backfill_github_activity } from './backfill-github-activity';
import { backup_database } from './backup-database';
import { cleanup_analytics } from './cleanup-analytics';
import { daily_github_activity } from './daily-github-activity';
import { export_training_data } from './export-training-data';
import { fetch_github_activity } from './fetch-github-activity';
import { index_now } from './index-now';
import { newsletter_send } from './newsletter-send';
import { pull_database } from './pull-database';
import { restore_database } from './restore-database';
import { rollup_analytics } from './rollup-analytics';
import { run_query, validate_run_query } from './run-query';
import { send_newsletter_reminder } from './send-newsletter-reminder';
import {
	standard_site_sync,
	validate_standard_site_sync,
} from './standard-site';
import {
	sync_blocked_domains,
	validate_sync_blocked_domains,
} from './sync-blocked-domains';
import { update_embeddings } from './update-embeddings';
import { update_posts } from './update-posts';
import { update_related_posts_table } from './update-related-posts';

type TaskFunction = (
	fetch: typeof globalThis.fetch,
	data?: unknown,
) => Promise<unknown>;

// Used by both the authenticated endpoint and the scheduler process.
export const tasks = {
	update_posts: () => update_posts(),
	index_now: (fetch) => index_now(fetch),
	update_embeddings: () => update_embeddings(),
	update_related_posts: () => update_related_posts_table(),
	export_training_data: () => export_training_data(),
	backup_database: () => backup_database(),
	pull_database: () => pull_database(),
	restore_database: () => restore_database(),
	newsletter_send: () => newsletter_send(),
	fetch_github_activity: () => fetch_github_activity(),
	backfill_github_activity: () => backfill_github_activity(),
	daily_github_activity: () => daily_github_activity(),
	send_newsletter_reminder: () => send_newsletter_reminder(),
	rollup_analytics: () => rollup_analytics(),
	cleanup_analytics: () => cleanup_analytics(),
	cleanup_task_logs: async () => get_task_log_store().purge(),
	query_task_logs: (_fetch, data) =>
		query_task_logs(validate_query_task_logs(data)),
	standard_site: (fetch, data) =>
		standard_site_sync(fetch, validate_standard_site_sync(data)),
	sync_blocked_domains: (_fetch, data) =>
		sync_blocked_domains(validate_sync_blocked_domains(data)),
	run_query: (_fetch, data) => run_query(validate_run_query(data)),
} satisfies Record<string, TaskFunction>;

export type TaskKey = keyof typeof tasks;

export const run_task = (
	name: TaskKey,
	fetch: typeof globalThis.fetch = globalThis.fetch,
	data?: unknown,
	options: TaskRunOptions = {},
): Promise<unknown> => {
	const task: TaskFunction = tasks[name];
	return run_logged_task(name, () => task(fetch, data), options);
};
