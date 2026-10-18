import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import {
	clear_cache,
	get_from_cache,
	set_cache,
	set_cache_version_reader,
} from './server-cache';

beforeEach(() => {
	vi.useFakeTimers();
	clear_cache();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Cross-process cache invalidation', () => {
	it('keeps cached data when the connection version has not changed', () => {
		const read_version = vi.fn().mockReturnValue(1);
		set_cache_version_reader(read_version);
		set_cache('posts', ['existing']);
		vi.advanceTimersByTime(1000);
		expect(get_from_cache('posts', 60_000)).toEqual(['existing']);
		expect(read_version).toHaveBeenCalledTimes(2);
	});

	it('clears stale data after a worker commit, at most once a second', () => {
		const read_version = vi.fn().mockReturnValue(1);
		set_cache_version_reader(read_version);
		set_cache('posts', ['old']);
		set_cache('tags', ['old tag']);
		read_version.mockReturnValue(2);

		expect(get_from_cache('posts', 60_000)).toEqual(['old']);
		expect(read_version).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(1000);
		expect(get_from_cache('posts', 60_000)).toBeNull();
		expect(get_from_cache('tags', 60_000)).toBeNull();
		set_cache('posts', ['new']);
		expect(get_from_cache('posts', 60_000)).toEqual(['new']);
		expect(read_version).toHaveBeenCalledTimes(2);
	});

	it('still expires entries and supports manual invalidation', () => {
		set_cache_version_reader(() => 1);
		set_cache('posts', ['old']);
		vi.advanceTimersByTime(1000);
		expect(get_from_cache('posts', 500)).toBeNull();
		set_cache('posts', ['new']);
		clear_cache();
		expect(get_from_cache('posts', 60_000)).toBeNull();
	});
});
