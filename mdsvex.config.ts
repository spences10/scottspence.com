import GithubSlugger from 'github-slugger';
import type { MdsvexOptions } from 'mdsvex';
import type { Plugin } from 'vite-plus';
import { highlight_options } from './src/lib/markdown/highlighter.ts';
import { enrich_metadata } from './src/lib/markdown/metadata.ts';

const extensions = ['.svelte.md', '.md', '.svx'];
const slugger = new GithubSlugger();

const config = {
	extensions,
	components: '#lib/markdown/components.ts',
	highlight: highlight_options,
	parse_plugins: [
		{
			sequential: true,
			// Every prepared document starts with frontmatter. The parser
			// does not dispatch root handlers, so reset heading IDs here.
			frontmatter: {
				parse() {
					slugger.reset();
				},
			},
			heading: {
				parse(node) {
					const link = node.wrap_inner('link');
					return () => {
						// Keep existing anchors: 0.x slugged inline-code entities.
						function heading_text(current = link): string {
							if (current.type === 'code_span') {
								return current.text_content
									.replaceAll('&', '&amp;')
									.replaceAll('<', '&lt;')
									.replaceAll('>', '&gt;')
									.replaceAll('{', '&#123;')
									.replaceAll('}', '&#125;');
							}
							let child = current.first_child;
							if (!child) return current.text_content;
							let text = '';
							while (child) {
								text += heading_text(child);
								child = child.next;
							}
							return text;
						}
						const id = slugger.slug(heading_text());
						node.attrs.id = id;
						link.attrs.href = `#${id}`;
					};
				},
			},
			link: {
				parse(node) {
					return () => {
						if (/^(?:https?:)?\/\//i.test(node.href ?? '')) {
							node.attrs.target = '_blank';
							node.attrs.rel = 'noopener noreferrer';
						}
					};
				},
			},
			list_item: {
				parse(node) {
					return () => {
						const first = node.first_child;
						const input =
							first?.type === 'paragraph' ? first.first_child : first;
						if (
							input?.type !== 'html' ||
							input.attrs.tag !== 'input' ||
							input.attrs.attributes?.type !== 'checkbox'
						)
							return;
						node.attrs.class = 'task-list-item';
						if (node.parent?.type === 'list') {
							node.parent.attrs.class = 'contains-task-list';
						}
					};
				},
			},
			image: {
				parse(node) {
					return () => {
						const src = node.attrs.src;
						if (!/\.(mp4|webm)$/i.test(src ?? '')) return;
						node.type = 'html';
						node.attrs.tag = 'video';
						node.attrs.attributes = {
							src,
							controls: true,
							'aria-label': node.text_content,
							class: 'w-full h-auto max-w-full',
							style: 'border-radius: var(--rounded-box, 1rem);',
						};
					};
				},
			},
		},
	],
} satisfies MdsvexOptions;

// Add computed site metadata. The native PFM body stays unchanged.
export const site_metadata: Plugin = {
	name: 'mdsvex-site-metadata',
	enforce: 'pre',
	transform(source, id) {
		if (/[?&](?:raw|url)(?:[=&]|$)/.test(id)) return;
		const filename = id.split('?', 1)[0];
		if (
			!extensions.some((extension) => filename.endsWith(extension))
		) {
			return;
		}
		return { code: enrich_metadata(source, filename), map: null };
	},
};

export default config;
