import { serialize } from '@mdsvex/migrate';
import { parse_markdown_svelte } from '@mdsvex/parse';
import path from 'node:path';
import remark_gfm from 'remark-gfm';
import remark_parse from 'remark-parse';
import { htmlFormatter, textFormatter } from 'remark-preview';
import remark_smartypants from 'remark-smartypants';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { parse, stringify } from 'yaml';

const parser = unified().use(remark_parse).use(remark_gfm);
const typography = unified().use(remark_smartypants, {
	dashes: 'oldschool',
});
const text_preview = textFormatter({ length: 250, maxBlocks: 2 });
const html_preview = htmlFormatter({ length: 250, maxBlocks: 2 });

/**
 * Trial compatibility bridge: keep the public CommonMark source intact,
 * but give mdsvex next PFM and the metadata our routes already use.
 */
export function prepare_markdown(source: string, filename: string) {
	const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(
		source,
	);
	const metadata = frontmatter
		? parse(frontmatter[1], { customTags: ['timestamp'] })
		: {};
	const body = frontmatter
		? source.slice(frontmatter[0].length)
		: source;
	// CommonMark does not understand Svelte expressions in tag attributes.
	// Let mdsvex find component tags, then keep those spans out of remark.
	const { nodes, source: normalised_body } =
		parse_markdown_svelte(body);
	const fragments: { start: number; end: number; source: string }[] =
		[];
	function collect(index: number) {
		const node = nodes.get_node(index);
		if (
			node.kind === 'html' &&
			node.metadata.self_closing &&
			/^[A-Z]/.test(node.metadata.tag)
		) {
			fragments.push({
				start: node.start,
				end: node.end,
				source: normalised_body.slice(node.start, node.end),
			});
			return;
		}
		for (const child of node.children) collect(child);
	}
	collect(0);
	let protected_body = normalised_body;
	for (let index = fragments.length - 1; index >= 0; index--) {
		const fragment = fragments[index];
		protected_body =
			protected_body.slice(0, fragment.start) +
			`<MdsvexMigrationOpaque id="${index}" />` +
			protected_body.slice(fragment.end);
	}
	const tree = parser.parse(protected_body);
	// Resolve references before typography or PFM changes their visible label.
	// The source can keep GitHub's shortcut syntax and definitions at the end.
	const definitions = new Map<
		string,
		{ url: string; title?: string | null }
	>();
	visit(tree, 'definition', (node) => {
		if (!definitions.has(node.identifier)) {
			definitions.set(node.identifier, node);
		}
	});
	visit(tree, 'linkReference', (node, index, parent) => {
		const definition = definitions.get(node.identifier);
		if (!definition || !parent || index === undefined) return;
		parent.children[index] = {
			type: 'link',
			url: definition.url,
			title: definition.title,
			children: node.children,
		};
	});
	visit(tree, 'imageReference', (node, index, parent) => {
		const definition = definitions.get(node.identifier);
		if (!definition || !parent || index === undefined) return;
		parent.children[index] = {
			type: 'image',
			url: definition.url,
			title: definition.title,
			alt: node.alt,
		};
	});
	typography.runSync(tree);
	const parsed_path = path.parse(filename);
	const slug =
		parsed_path.name === 'index'
			? path.basename(parsed_path.dir)
			: parsed_path.name;
	const words = source.split(/\s+/).length;
	const minutes = Math.ceil(words / 230);
	const file = { data: { fm: metadata } };
	const enriched = {
		...metadata,
		preview: text_preview.truncate(text_preview.parse(tree)),
		// Add the old preview link policy after the formatter sanitises HTML.
		previewHtml: html_preview
			.truncate(html_preview.parse(tree, file))
			.replace(
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

	// PFM does not have built-in GFM task-list syntax. Keep task state as
	// static, labelled HTML rather than letting [ ] render as plain text.
	visit(tree, 'listItem', (node) => {
		if (typeof node.checked !== 'boolean') return;
		const checked = node.checked;
		node.checked = null;
		let paragraph = node.children[0];
		if (paragraph?.type !== 'paragraph') {
			paragraph = { type: 'paragraph', children: [] };
			node.children.unshift(paragraph);
		}
		const label_parts: string[] = [];
		visit(paragraph, (child) => {
			if (child.type === 'text' || child.type === 'inlineCode') {
				label_parts.push(child.value);
			}
		});
		const label = (
			label_parts.join('').replaceAll(/\s+/g, ' ').trim() || 'Task'
		)
			.replaceAll('&', '&amp;')
			.replaceAll('"', '&quot;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('{', '&#123;')
			.replaceAll('}', '&#125;');
		paragraph.children.unshift({
			type: 'html',
			value: `<input type="checkbox" disabled${checked ? ' checked' : ''} aria-label="${label}" /> `,
		});
	});

	// Match the old highlighter's case and js:title fence handling.
	visit(tree, 'code', (node) => {
		if (node.lang)
			node.lang = node.lang.toLowerCase().split(':', 1)[0];
	});
	const pfm = serialize(tree).replace(
		/<MdsvexMigrationOpaque id="(\d+)" \/>/g,
		(_, index) => fragments[Number(index)].source,
	);
	return `---\n${stringify(enriched)}---\n\n${pfm}`;
}
