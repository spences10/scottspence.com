import type { SqliteClient } from '#lib/sqlite/client.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	get_breakdowns_since,
	group_breakdowns,
	referrer_source,
	rollup_bots,
	rollup_breakdowns,
	type BreakdownEvent,
} from './breakdown-rollup';

const project_root = path.resolve(import.meta.dirname, '../../..');
const migration = (name: string) =>
	readFileSync(path.join(project_root, 'migrations', name), 'utf8');

/** The SqliteClient surface rollup_breakdowns uses, over a real DB */
const client_for = (db: DatabaseSync) =>
	({
		execute: (query: string | { sql: string; args?: unknown[] }) => {
			const { sql, args = [] } =
				typeof query === 'string' ? { sql: query } : query;
			return {
				rows: db.prepare(sql).all(...(args as SQLInputValue[])),
			};
		},
		batch: (queries: { sql: string; args?: unknown[] }[]) => {
			db.exec('BEGIN');
			for (const { sql, args = [] } of queries) {
				db.prepare(sql).run(...(args as SQLInputValue[]));
			}
			db.exec('COMMIT');
			return { success: true };
		},
	}) as unknown as SqliteClient;

const event = (
	overrides: Partial<BreakdownEvent>,
): BreakdownEvent => ({
	path: '/posts/a',
	referrer: null,
	country: 'GB',
	browser: 'Firefox',
	device_type: 'desktop',
	visitor_hash: 'v1',
	...overrides,
});

describe('referrer_source', () => {
	it('labels no referrer as Direct and normalises the rest', () => {
		expect(referrer_source(null)).toBe('Direct');
		expect(referrer_source('')).toBe('Direct');
		expect(referrer_source('https://www.google.co.uk/')).toBe(
			'Google',
		);
		expect(
			referrer_source('https://news.ycombinator.com/item?id=1'),
		).toBe('news.ycombinator.com');
	});

	it('drops internal referrers', () => {
		expect(referrer_source('https://ss10.dev/')).toBeNull();
	});
});

describe('group_breakdowns', () => {
	it('counts views and exact unique visitors per value', () => {
		const { breakdowns } = group_breakdowns([
			event({ visitor_hash: 'v1' }),
			event({ visitor_hash: 'v1', path: '/posts/b' }),
			event({ visitor_hash: 'v2', country: 'US' }),
		]);

		expect(breakdowns).toContainEqual({
			dimension: 'country',
			value: 'GB',
			views: 2,
			unique_visitors: 1,
		});
		expect(breakdowns).toContainEqual({
			dimension: 'referrer',
			value: 'Direct',
			views: 3,
			unique_visitors: 2,
		});
	});

	it('groups referrer variants under one source', () => {
		const { breakdowns } = group_breakdowns([
			event({
				referrer: 'https://www.google.com/',
				visitor_hash: 'v1',
			}),
			event({
				referrer: 'https://www.google.de/',
				visitor_hash: 'v2',
			}),
		]);
		expect(breakdowns).toContainEqual({
			dimension: 'referrer',
			value: 'Google',
			views: 2,
			unique_visitors: 2,
		});
	});

	it('skips missing values and internal referrers', () => {
		const { breakdowns, post_referrers } = group_breakdowns([
			event({
				referrer: 'https://spences10.dev/',
				country: null,
				browser: null,
				device_type: null,
			}),
		]);
		expect(breakdowns).toEqual([]);
		expect(post_referrers).toEqual([]);
	});

	it('keeps per-post referrers for posts only', () => {
		const { post_referrers } = group_breakdowns([
			event({ path: '/posts/a', referrer: 'https://kagi.com/' }),
			event({ path: '/', referrer: 'https://kagi.com/' }),
		]);
		expect(post_referrers).toEqual([
			{
				pathname: '/posts/a',
				referrer: 'Kagi',
				views: 1,
				unique_visitors: 1,
			},
		]);
	});
});

describe('rollup_breakdowns', () => {
	const day = '2026-10-13';
	const start = Date.parse(`${day}T00:00:00Z`);
	let db: DatabaseSync;
	let client: SqliteClient;

	const insert_event = (
		values: Partial<BreakdownEvent> & {
			is_bot?: number;
			created_at?: number;
		},
	) => {
		const e = {
			...event(values),
			is_bot: 0,
			created_at: start + 1000,
			...values,
		};
		db.prepare(
			`INSERT INTO analytics_events
				(visitor_hash, path, referrer, country, browser, device_type, is_bot, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		).run(
			e.visitor_hash,
			e.path,
			e.referrer,
			e.country,
			e.browser,
			e.device_type,
			e.is_bot,
			e.created_at,
		);
	};

	beforeEach(() => {
		db = new DatabaseSync(':memory:');
		db.exec(migration('003_add_analytics_events.sql'));
		db.exec(migration('014_add_analytics_breakdowns.sql'));
		db.exec(migration('015_add_analytics_daily_bots.sql'));
		client = client_for(db);
	});

	it('writes human breakdowns for the day and leaves bots out', () => {
		insert_event({
			visitor_hash: 'h1',
			referrer: 'https://kagi.com/',
		});
		insert_event({ visitor_hash: 'h2' });
		insert_event({ visitor_hash: 'bot', is_bot: 1, country: 'FR' });
		// Outside the day
		insert_event({ visitor_hash: 'late', created_at: start + 864e5 });

		const result = rollup_breakdowns(
			client,
			day,
			start,
			start + 864e5,
		);

		const rows = db
			.prepare(
				`SELECT dimension, value, views, unique_visitors
				FROM analytics_daily_breakdown WHERE date = ? ORDER BY dimension, value`,
			)
			.all(day);
		expect(rows).toEqual([
			{
				dimension: 'browser',
				value: 'Firefox',
				views: 2,
				unique_visitors: 2,
			},
			{
				dimension: 'country',
				value: 'GB',
				views: 2,
				unique_visitors: 2,
			},
			{
				dimension: 'device',
				value: 'desktop',
				views: 2,
				unique_visitors: 2,
			},
			{
				dimension: 'referrer',
				value: 'Direct',
				views: 1,
				unique_visitors: 1,
			},
			{
				dimension: 'referrer',
				value: 'Kagi',
				views: 1,
				unique_visitors: 1,
			},
		]);
		expect(result).toEqual({ breakdowns: 5, post_referrers: 2 });
	});

	it('replaces the day on a rerun instead of doubling it', () => {
		insert_event({ visitor_hash: 'h1' });
		rollup_breakdowns(client, day, start, start + 864e5);
		rollup_breakdowns(client, day, start, start + 864e5);

		const { views } = db
			.prepare(
				`SELECT SUM(views) AS views FROM analytics_daily_breakdown
				WHERE date = ? AND dimension = 'country'`,
			)
			.get(day) as { views: number };
		expect(views).toBe(1);
	});

	it('totals flagged bots for the day', () => {
		insert_event({ visitor_hash: 'bot-a', is_bot: 1 });
		insert_event({ visitor_hash: 'bot-a', is_bot: 1, path: '/' });
		insert_event({ visitor_hash: 'bot-b', is_bot: 1 });
		insert_event({ visitor_hash: 'human' });

		expect(rollup_bots(client, day, start, start + 864e5)).toEqual({
			views: 3,
			unique_visitors: 2,
		});
		// Reruns replace the day
		rollup_bots(client, day, start, start + 864e5);
		expect(
			db.prepare('SELECT * FROM analytics_daily_bots').all(),
		).toEqual([{ date: day, views: 3, unique_visitors: 2 }]);
	});

	it('reports coverage from the later of the two rollups', () => {
		expect(get_breakdowns_since(client)).toBeNull();

		insert_event({ visitor_hash: 'h1' });
		rollup_breakdowns(client, '2026-10-12', start, start + 864e5);
		// Breakdowns alone are not enough: bot totals start later
		expect(get_breakdowns_since(client)).toBeNull();

		rollup_bots(client, day, start, start + 864e5);
		expect(get_breakdowns_since(client)).toBe(day);
	});
});
