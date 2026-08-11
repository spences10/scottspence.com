import { standard_site_publication_uri } from '../../../lib/standard-site';

export const GET = () =>
	new Response(standard_site_publication_uri, {
		headers: {
			'cache-control': 'public, max-age=3600',
			'content-type': 'text/plain; charset=utf-8',
		},
	});
