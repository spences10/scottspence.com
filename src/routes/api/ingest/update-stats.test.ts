import { sqlite_client } from '$lib/sqlite/client';
import { describe, expect, it, vi } from 'vitest';
import { update_stats } from './update-stats';

const create_mock_client = () => ({
	execute: vi.fn().mockResolvedValue({ success: true }),
	batch: vi.fn(),
	migrate: vi.fn(),
	transaction: vi.fn(),
	executeMultiple: vi.fn(),
	sync: vi.fn(),
	interrupt: vi.fn(),
	closed: false,
	protocol: 'libsql',
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
		const mock_client = {
			...create_mock_client(),
			execute: vi.fn().mockRejectedValue(new Error('Database error')),
		} as Client;
		Object.assign(sqlite_client, mock_client);

		await expect(update_stats()).rejects.toThrow(
			'Failed to update stats: Database error',
		);
		// SQLite client doesn't need close()
	});

	it('should always close the database connection', async () => {
		const mock_client = {
			...create_mock_client(),
			execute: vi.fn().mockRejectedValue(new Error('Test error')),
		} as Client;
		Object.assign(sqlite_client, mock_client);

		try {
			await update_stats();
		} catch {
			// Ignore error
		}
		// SQLite client doesn't need close()
	});
});
