import { description, name, website } from '$lib/info'
import { get_posts } from '$lib/posts'

export const prerender = true

interface RSSItem {
	title: string
	url: string
	description: string
	date: string
	content: string
}

export const GET = async () => {
	try {
		const { posts } = await get_posts()

		// Filter out private posts and transform into RSS items
		const rss_items: RSSItem[] = posts
			.filter((post) => !post.is_private)
			.map(({ title, slug, date, preview, preview_html }) => ({
				title,
				url: `${website}/posts/${slug}/`,
				description: preview,
				date: new Date(date).toISOString(),
				content: preview_html || '',
			}))

		const body = render_rss_feed(rss_items)

		return new Response(body, {
			headers: {
				'content-type': 'application/xml',
				'cache-control':
					'public, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=3600',
			},
		})
	} catch (error) {
		console.warn(
			'Database unavailable, generating empty RSS feed:',
			error instanceof Error ? error.message : 'Unknown error',
		)

		// Return minimal RSS feed when database is down
		const empty_feed = render_rss_feed([])

		return new Response(empty_feed, {
			headers: {
				'content-type': 'application/xml',
				'cache-control': 'public, no-cache, max-age=300', // 5 min cache when in fallback mode
			},
		})
	}
}

const render_rss_items = (items: RSSItem[]) => {
	return items
		.map(
			({ title, url, description, date, content }) => `
			<entry>
				<title><![CDATA[${title}]]></title>
				<link rel="alternate" type="text/html" href="${url}"/>
				<id>${url}</id>
				<published>${date}</published>
				<updated>${date}</updated>
				<author>
					<name>${name}</name>
				</author>
				<summary type="html"><![CDATA[${description}]]></summary>
				<content type="html">
					<![CDATA[
						${content}
						<div style="margin-top: 50px; font-style: italic;">
							<strong>
								<a href="${url}">
									Keep reading
								</a>
							</strong>  
						</div>
					]]>
				</content>
			</entry>`,
		)
		.join('\n')
}

const render_rss_feed = (items: RSSItem[]) => {
	return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${name}'s Blog</title>
	<subtitle>${description}</subtitle>
	<link rel="alternate" type="text/html" href="${website}/"/>
	<link rel="self" type="application/atom+xml" href="${website}/rss.xml"/>
	<id>${website}/</id>
	<updated>${new Date().toISOString()}</updated>
	${render_rss_items(items)}
</feed>`
}
