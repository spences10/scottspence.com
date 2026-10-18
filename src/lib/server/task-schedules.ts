import type { TaskKey } from '../../routes/api/ingest/tasks';

export interface TaskSchedule {
	name: TaskKey;
	cron: string;
}

// All times are UTC. The hourly post job also refreshes embeddings and
// related posts before the publishing job.
export const task_schedules: TaskSchedule[] = [
	{ name: 'update_posts', cron: '0 * * * *' },
	{ name: 'standard_site', cron: '0 * * * *' },
	{ name: 'backup_database', cron: '0 */6 * * *' },
	{ name: 'index_now', cron: '0 0 * * *' },
	{ name: 'send_newsletter_reminder', cron: '0 9 28 * *' },
	{ name: 'daily_github_activity', cron: '0 2 * * *' },
	{ name: 'rollup_analytics', cron: '5 3 * * *' },
	{ name: 'cleanup_analytics', cron: '15 3 * * *' },
	{ name: 'cleanup_task_logs', cron: '30 3 * * *' },
];
