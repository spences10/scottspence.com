import { fromHtml } from 'hast-util-from-html';
import { sanitize } from 'hast-util-sanitize';
import { toHtml } from 'hast-util-to-html';
import { toText } from 'hast-util-to-text';
import path from 'node:path';
import truncate_html from 'truncate-html';
import { parse, stringify } from 'yaml';
import { render_pfm } from './render.ts';

const frontmatter_pattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/** Add site metadata without converting or changing the native PFM body. */
export function enrich_metadata(source: string, filename: string) {
	const frontmatter = frontmatter_pattern.exec(source);
	const metadata = frontmatter
		? parse(frontmatter[1], { customTags: ['timestamp'] })
		: {};
	const body = frontmatter
		? source.slice(frontmatter[0].length)
		: source;
	const preview_tree = sanitize(
		fromHtml(render_pfm(body), { fragment: true }),
	);
	if (preview_tree.type !== 'root') {
		throw new Error(`Expected a preview fragment in ${filename}`);
	}
	preview_tree.children = preview_tree.children
		.filter((node) => node.type === 'element')
		.slice(0, 2);
	const preview_html = toHtml(preview_tree);
	const text = toText(preview_tree).trim();
	const parsed_path = path.parse(filename);
	const slug =
		parsed_path.name === 'index'
			? path.basename(parsed_path.dir)
			: parsed_path.name;
	const words = source.split(/\s+/).length;
	const minutes = Math.ceil(words / 230);

	const enriched = {
		...metadata,
		preview: truncate_html(text, 250, {
			stripTags: true,
			reserveLastWord: true,
		}),
		previewHtml: truncate_html(preview_html, 250).replace(
			/(<a href="(?:https?:)?\/\/[^"]*")/gi,
			'$1 rel="nofollow"',
		),
		slug,
		reading_time: {
			minutes,
			text: `${minutes} min read`,
			time: minutes * 60 * 1000,
			words,
		},
	};
	return `---\n${stringify(enriched)}---\n${body}`;
}
