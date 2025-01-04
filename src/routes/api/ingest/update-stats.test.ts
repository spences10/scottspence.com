import { turso_client } from '$lib/turso';
import { describe, expect, it, vi } from 'vitest';
import { update_stats } from './update-stats';

vi.mock('$lib/turso', () => ({
	turso_client: vi.fn(() => ({
		execute: vi.fn().mockResolvedValue({ success: true }),
		close: vi.fn(),
	})),
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
			execute: vi.fn().mockRejectedValue(new Error('Database error')),
			close: vi.fn(),
		};
		vi.mocked(turso_client).mockReturnValue(mock_client);

		await expect(update_stats()).rejects.toThrow(
			'Failed to update stats: Database error',
		);
		expect(mock_client.close).toHaveBeenCalled();
	});

	it('should always close the database connection', async () => {
		const mock_client = {
			execute: vi.fn().mockRejectedValue(new Error('Test error')),
			close: vi.fn(),
		};
		vi.mocked(turso_client).mockReturnValue(mock_client);

		try {
			await update_stats();
		} catch {
			// Ignore error
		}
		expect(mock_client.close).toHaveBeenCalled();
	});
});
