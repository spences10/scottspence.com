import { website } from '$lib/info'
import { get_post_tags } from '$lib/post-tags'
import { get_posts } from '$lib/posts'
import fs from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'

interface PageInfo {
	path: string
	last_mod: string
	priority: number
}

async function discover_pages(
	root_dir: string = 'src/routes',
): Promise<PageInfo[]> {
	const pages: PageInfo[] = []

	async function scan_directory(dir: string, base_path: string = '') {
		const entries = await fs.readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			const full_path = path.join(dir, entry.name)
			const route_path = path.join(base_path, entry.name)

			if (entry.isDirectory()) {
				// Skip api routes, private routes (starting with _), and special SvelteKit routes
				if (
					!entry.name.startsWith('api') &&
					!entry.name.startsWith('_') &&
					!entry.name.startsWith('[')
				) {
					await scan_directory(full_path, route_path)
				}
			} else if (entry.name === '+page.svelte') {
				const stats = await fs.stat(full_path)
				const normalized_path = base_path
					.replace(/\\/g, '/') // Convert Windows paths
					.replace(/^\/?/, '') // Remove leading slash

				// Skip dynamic routes and the root page
				if (
					!normalized_path.includes('[') &&
					normalized_path !== ''
				) {
					pages.push({
						path: normalized_path,
						last_mod: stats.mtime.toISOString().split('T')[0],
						// Assign priority based on path depth
						priority:
							0.8 - (normalized_path.split('/').length - 1) * 0.1,
					})
				}
			}
		}
	}

	await scan_directory(root_dir)
	return pages
}

export const GET = async () => {
	const [{ posts: posts_metadata }, { tags }, pages] =
		await Promise.all([
			get_posts(),
			get_post_tags(),
			discover_pages(),
		])

	const body = render_sitemap(pages, tags, posts_metadata)

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control':
				'public, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=3600',
		},
	})
}

const render_pages = (pages: PageInfo[]) => {
	return pages
		.map(
			({ path, last_mod, priority }) => `
        <url>
          <loc>${website}${path ? `/${path}` : ''}</loc>
          <lastmod>${last_mod}</lastmod>
          <priority>${priority}</priority>
        </url>
      `,
		)
		.join('')
}

const render_posts = (posts_metadata: Post[]) => {
	return posts_metadata
		.filter(({ is_private }) => !is_private)
		.map(
			({ slug, date }) => `
        <url>
          <loc>${website}/posts/${slug}</loc>
          <lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>
          <priority>0.7</priority>
        </url>
      `,
		)
		.join('')
}

const render_tags = (tags: string[]) => {
	return tags
		.map(
			(tag: string) => `
        <url>
          <loc>${website}/tags/${slugify(tag)}</loc>
          <priority>0.5</priority>
        </url>
      `,
		)
		.join('')
}

const render_sitemap = (
	pages: PageInfo[],
	tags: string[],
	posts_metadata: Post[],
) => {
	return `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset 
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      ${render_pages(pages)}
      ${render_posts(posts_metadata)}
      ${render_tags(tags)}
    </urlset>`
}

// looks like changefreq isn't used by Google any more
// https://twitter.com/askRodney/status/1615409186782715904
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://stackoverflow.com/questions/20257299/sitemap-xml-should-i-prefer-lastmod-to-changefreq#20917200
