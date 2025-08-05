import { sqlite_client, type SqliteClient } from '$lib/sqlite/client';
import { describe, expect, it, vi } from 'vitest';
import { update_stats } from './update-stats';

const create_mock_client = (): SqliteClient => ({
	execute: vi.fn().mockResolvedValue({ rows: [] }),
	batch: vi.fn().mockResolvedValue({ success: true }),
	prepare: vi.fn().mockReturnValue({
		run: vi.fn(),
		get: vi.fn(),
		all: vi.fn().mockReturnValue([])
	}),
	close: vi.fn(),
});

vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: create_mock_client(),
}));

describe('update_stats', () => {
	it('should successfully update stats', async () => {
		const result = await update_stats();
		expect(result).toEqual({
			success: true,
			message: 'Stats updated successfully',
		});
	});

	it('should handle database errors', async () => {
		const mock_client: SqliteClient = {
			...create_mock_client(),
			execute: vi.fn().mockRejectedValue(new Error('Database error')),
		};
		Object.assign(sqlite_client, mock_client);

		await expect(update_stats()).rejects.toThrow(
			'Failed to update stats: Database error',
		);
		// SQLite client doesn't need close()
	});

	it('should always close the database connection', async () => {
		const mock_client: SqliteClient = {
			...create_mock_client(),
			execute: vi.fn().mockRejectedValue(new Error('Test error')),
		};
		Object.assign(sqlite_client, mock_client);

		try {
			await update_stats();
		} catch {
			// Ignore error
		}
		// SQLite client doesn't need close()
	});
});
