import { get_shared_posts } from '#lib/server/bluesky-posts.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const data = await get_shared_posts(fetch);
		return Response.json(data, {
			headers: {
				'cache-control':
					'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
			},
		});
	} catch {
		return Response.json(
			{ error: 'Bluesky feed could not be loaded.' },
			{ status: 502 },
		);
	}
};
