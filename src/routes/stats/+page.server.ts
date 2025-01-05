import { turso_client } from '$lib/turso';
import type { Value } from '@libsql/client';

// Base stat type used across different time periods
interface SiteStat {
	views: number;
	unique_visitors: number;
}

// Monthly statistics
interface MonthlyStat extends SiteStat {
	year_month: string; // Format: YYYY-MM
}

// Yearly statistics
interface YearlyStat extends SiteStat {
	year: string; // Format: YYYY
}

// Combined site statistics for a page/post
interface SiteStats {
	slug: string;
	title: string;
	monthly_stats: MonthlyStat[];
	yearly_stats: YearlyStat[];
	all_time_stats: SiteStat;
}

// Raw database row type
interface StatsRow {
	slug: Value;
	title: Value;
	monthly_stats: Value;
	yearly_stats: Value;
	all_time_stats: Value;
}

export const load = async () => {
	const client = turso_client();

	try {
		const result = await client.execute({
			sql: `
				SELECT 
					p.slug,
					p.title,
					-- Get monthly stats
					COALESCE(json_group_array(
						json_object(
							'year_month', m.year_month,
							'views', m.views,
							'unique_visitors', m.unique_visitors
						)
					), '[]') as monthly_stats,
					-- Get yearly stats
					COALESCE(json_group_array(
						json_object(
							'year', y.year,
							'views', y.views,
							'unique_visitors', y.unique_visitors
						)
					), '[]') as yearly_stats,
					-- Get all time stats
					json_object(
						'views', COALESCE(at.views, 0),
						'unique_visitors', COALESCE(at.unique_visitors, 0)
					) as all_time_stats
				FROM posts p
				LEFT JOIN analytics_monthly m ON m.pathname = '/posts/' || p.slug
				LEFT JOIN analytics_yearly y ON y.pathname = '/posts/' || p.slug
				LEFT JOIN analytics_all_time at ON at.pathname = '/posts/' || p.slug
				GROUP BY p.slug
				ORDER BY json_extract(all_time_stats, '$.views') DESC
				LIMIT 500;
			`,
			args: [],
		});

		const site_stats: SiteStats[] = result.rows.map((row) => ({
			slug: String(row.slug),
			title: String(row.title),
			monthly_stats: JSON.parse(String(row.monthly_stats)),
			yearly_stats: JSON.parse(String(row.yearly_stats)),
			all_time_stats: JSON.parse(String(row.all_time_stats)),
		}));

		return {
			site_stats,
			current_month: new Date().toISOString().slice(0, 7),
			current_year: new Date().getFullYear().toString(),
		};
	} catch (error) {
		console.error('Error fetching from Turso DB:', error);
		return {
			site_stats: [],
			error: 'Error fetching site stats data',
			current_month: new Date().toISOString().slice(0, 7),
			current_year: new Date().getFullYear().toString(),
		};
	} finally {
		client.close();
	}
};
