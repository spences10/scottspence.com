// @ts-nocheck
import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import path from 'node:path';
import autolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import slugPlugin from 'rehype-slug';
import preview, {
	htmlFormatter,
	textFormatter,
} from 'remark-preview';
import { EXIT, visit } from 'unist-util-visit';
import { highlight_code } from './src/lib/markdown/highlighter.ts';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],
	highlight: {
		highlighter: highlight_code,
	},

	smartypants: {
		dashes: 'oldschool',
	},
	remarkPlugins: [
		// Add a text preview snippet (no formatting) so we can use it in the meta description tag
		preview(textFormatter({ length: 250, maxBlocks: 2 })),

		// Add an HTML preview snippet (formatted) so we can use it when displaying all posts
		preview(
			htmlFormatter({
				length: 250,
				maxBlocks: 2,
			}),
			{
				attribute: 'previewHtml',
			},
		),
		posts,
		videos,
		code_block_import,
	],
	rehypePlugins: [
		slugPlugin,
		[
			autolinkHeadings,
			{
				behavior: 'wrap',
			},
		],
		[
			rehypeExternalLinks,
			{ target: '_blank', rel: 'noopener noreferrer' },
		],
	],
});

export default config;

/**
 * Add slug to metadata and convert `date` timezone to UTC
 */
function posts() {
	return (_, file) => {
		const parsed = path.parse(file.filename);
		const slug =
			parsed.name === 'index'
				? path.parse(file.filename).dir.split('/').pop()
				: parsed.name;

		// Calculate reading time
		const content = file.contents.toString();
		const words = content.split(/\s+/).length;
		const reading_time_minutes = Math.ceil(words / 230); // 230 words per minute

		file.data.fm = {
			...file.data.fm,
			slug,
			reading_time: {
				minutes: reading_time_minutes,
				text: `${reading_time_minutes} min read`,
				time: reading_time_minutes * 60 * 1000, // milliseconds
				words: words,
			},
		};
	};
}

/**
 * The highlighter emits <CodeBlock>, import it into any file with
 * fenced code, reusing the instance script if the file has one
 */
function code_block_import() {
	const code_block_import =
		"import CodeBlock from '#lib/components/code-block.svelte';";
	const instance_script =
		/^\s*<script(?![^>]*\bcontext=)(?![^>]*\bmodule\b)[^>]*>/;

	return function transformer(tree) {
		let has_code = false;
		visit(tree, 'code', () => {
			has_code = true;
			return EXIT;
		});
		if (!has_code) return;

		let script;
		visit(tree, 'html', (node) => {
			if (instance_script.test(node.value)) {
				script = node;
				return EXIT;
			}
		});

		if (script) {
			script.value = script.value.replace(
				instance_script,
				(tag) => `${tag}\n\t${code_block_import}`,
			);
		} else {
			tree.children.unshift({
				type: 'html',
				value: `<script>\n\t${code_block_import}\n</script>`,
			});
		}
	};
}

/**
 * Adds support to video files in markdown image links
 */
function videos() {
	const extensions = ['mp4', 'webm'];
	return function transformer(tree) {
		visit(tree, 'image', (node) => {
			if (extensions.some((ext) => node.url.endsWith(ext))) {
				node.type = 'html';
				node.value = `
            <video
              src="${node.url}"
              autoplay
              muted
              playsinline
              loop
              title="${node.alt}"
            />
          `;
			}
		});
	};
}
