import { getRequestEvent, query } from '$app/server';
import {
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '#lib/cache/server-cache.js';
import { daily_cap, ratelimit } from '#lib/server/rate-limit.js';
import * as v from 'valibot';
import { search_posts_by_embedding } from '../../routes/api/ingest/embeddings';

// Ceiling on paid embedding calls per day, whoever is asking
const MAX_DAILY_SEARCHES = 5000;

export const search_posts = query(
	v.pipe(v.string(), v.trim(), v.minLength(3), v.maxLength(100)),
	async (search_text: string): Promise<RelatedPost[]> => {
		// Check server cache first
		const cache_key = `search_posts_${search_text.toLowerCase()}`;
		const cached = get_from_cache<RelatedPost[]>(
			cache_key,
			CACHE_DURATIONS.search_posts,
		);
		if (cached) {
			return cached;
		}

		try {
			// Every uncached search is a paid embedding call, so limit per IP
			const { request } = getRequestEvent();
			const ip =
				request.headers.get('x-forwarded-for')?.split(',')[0] ||
				request.headers.get('x-real-ip') ||
				'unknown';
			const rate_limit_attempt = ratelimit.limit(
				`search_posts:${ip}`,
			);
			if (!rate_limit_attempt.success) {
				return [];
			}

			const daily_attempt = daily_cap.take(
				'search_posts',
				MAX_DAILY_SEARCHES,
			);
			if (!daily_attempt.success) {
				return [];
			}
			if (daily_attempt.remaining === 0) {
				console.warn(
					`Semantic post search hit its daily cap of ${MAX_DAILY_SEARCHES}`,
				);
			}

			const results = await search_posts_by_embedding(search_text, 5);

			// Cache the result
			set_cache(cache_key, results);
			return results;
		} catch (error) {
			console.warn('Semantic post search unavailable:', error);
			return [];
		}
	},
);
