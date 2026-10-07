import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { compile as compile_markdown } from 'mdsvex/compile';
import {
	create_highlight,
	load_default_languages,
} from 'mdsvex/highlight';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';
import mdsvex_config from '../../../mdsvex.config.js';
import { highlight_options } from './highlighter.js';
import { prepare_markdown } from './prepare-markdown.js';

const highlight = create_highlight({
	...highlight_options,
	languages: {
		...(await load_default_languages()),
		...highlight_options.languages,
	},
});

function compile_document(source: string, filename = 'post.md') {
	return compile_markdown(prepare_markdown(source, filename), {
		parse_plugins: mdsvex_config.parse_plugins,
		components: [
			{ specifier: '#lib/markdown/components.ts', names: ['pre'] },
		],
		highlight,
		filename,
	});
}

function fence(code: string, language = '', meta = '') {
	return compile_document(
		`\`\`\`${language} ${meta}\n${code}\n\`\`\``,
	).code;
}

describe('native mdsvex highlighting', () => {
	it.each([
		['ts', 'const value = 42;'],
		['graphql', 'query GetUser { user { name } }'],
		['powershell', 'if ($true) { Write-Output "hello" }'],
		['ps', 'if ($true) { Write-Output "hello" }'],
		['dockerfile', 'FROM node:24\nRUN echo "hello"'],
		['docker', 'FROM node:24\nRUN echo "hello"'],
	])(
		'highlights %s fences in the code-block component',
		(language, code) => {
			const output = fence(code, language);
			expect(output).toContain('<Pre_MDSVEX_G ');
			expect(output).toContain(`language-${language}`);
			expect(output).toContain('tok keyword');
			expect(output).not.toContain('{@html');
		},
	);

	it('escapes unsupported languages and unnamed fences', () => {
		const output = fence(
			'<script>alert("no")</script>',
			'unknown-language',
		);
		expect(output).toContain('&lt;script&gt;');
		expect(output.slice(output.indexOf('<pre class='))).not.toContain(
			'<script>alert',
		);
		expect(() =>
			compile(output, { filename: 'plain.svelte' }),
		).not.toThrow();
		expect(fence('just text')).toContain('just text');
	});

	it('preserves line highlights, titles and line-number offsets', () => {
		const output = fence(
			'const a = 1;\nconst b = 2;',
			'ts',
			'{2} :line-numbers=99 title="math.ts" caption="Example"',
		);
		expect(output).toContain('l highlight');
		expect(output).toContain('class="ln">100<');
		expect(output).toContain('tabindex="0"');
		expect(output).toContain('title={"math.ts"}');
		expect(output).toContain('caption={"Example"}');
	});

	it('passes visible text to the copy button without annotation markers', () => {
		const output = fence('const value = 42; // [!hl]', 'ts');
		expect(output).toContain('code={"const value = 42;"}');
		expect(output).toContain('l highlight');
	});

	it('keeps Svelte expressions in code as text', () => {
		const output = fence('<button>{count} `tick`</button>', 'svelte');
		expect(output).toContain('&#123;');
		expect(() =>
			compile(output, { filename: 'code.svelte' }),
		).not.toThrow();
	});

	it('supports live values in code without changing other braces', () => {
		const output = compile_document(
			'<script>const command = "pnpm add";</script>\n\n```sh eval\n{command} example\n```',
		).code;
		expect(output).toContain('code={`${command} example`}');
		expect(() =>
			compile(output, { filename: 'live-code.svelte' }),
		).not.toThrow();
	});

	it('reuses an existing instance script', () => {
		const output = compile_document(
			'<script lang="ts">\nconst x = 1;\n</script>\n\n```ts\nconst a = 1;\n```',
		).code;
		expect(output.match(/<script lang="ts">/g)).toHaveLength(1);
		expect(output.match(/pre as Pre_MDSVEX_G/g)).toHaveLength(1);
	});

	it('does not import code-block controls in documents without fences', () => {
		expect(compile_document('# No code here').code).not.toContain(
			'Pre_MDSVEX_G',
		);
	});
});

describe('CommonMark compatibility and site features', () => {
	it('keeps emphasis, forward references and punctuation', () => {
		const result = compile_document(
			'**Strong**, *emphasis* and [a link][ref].\n\n"Hello" -- world...\n\n[ref]: https://example.com',
		);
		expect(result.code).toContain('<strong>Strong</strong>');
		expect(result.code).toContain('<em>emphasis</em>');
		expect(result.code).toContain('href="https://example.com"');
		expect(result.code).toContain('“Hello” – world…');
	});

	it.each([
		['[somelink]', '[somelink]: https://example.com', 'somelink'],
		['[somelink][]', '[somelink]:https://example.com', 'somelink'],
		[
			"[Scott's site]",
			"[Scott's site]: https://example.com",
			'Scott’s site',
		],
		[
			'[some **link**]',
			'[some **link**]: https://example.com',
			'some <strong>link</strong>',
		],
	])(
		'resolves reference links before transforming %s',
		(reference, definition, label) => {
			const output = compile_document(
				`${reference}\n\n${definition}`,
			).code;
			expect(output).toContain(
				`<a href="https://example.com" target="_blank" rel="noopener noreferrer">${label}</a>`,
			);
		},
	);

	it('resolves shortcut images with a multiline, case-insensitive definition', () => {
		const output = compile_document(
			'![highlightVLive]\n\n[highlightvlive]:\n\thttps://example.com/demo.png',
		).code;
		expect(output).toContain(
			'<img src="https://example.com/demo.png" alt="highlightVLive" />',
		);
		expect(output).not.toContain('![highlightVLive]');
	});

	it('renders the reference image in the Testing MDX post', () => {
		const output = compile_document(
			readFileSync('posts/testing-mdx.md', 'utf8'),
		).code;
		expect(output).toContain(
			'<img src="https://res.cloudinary.com/defkmsrpw/',
		);
		expect(output).toContain('alt="highlightVLive"');
		expect(output).not.toContain('![highlightVLive]');
	});

	it('renders checked and unchecked GFM tasks as labelled, disabled checkboxes', () => {
		const output = compile_document(
			'- [ ] Autolink headers\n- [x] Run `npm test`',
		).code;
		const body = output.slice(output.lastIndexOf('</script>'));
		expect(body).toContain('class="contains-task-list"');
		expect(body.match(/class="task-list-item"/g)).toHaveLength(2);
		expect(body).toContain(
			'<input type="checkbox" disabled aria-label="Autolink headers"',
		);
		expect(body).toContain(
			'<input type="checkbox" disabled checked aria-label="Run npm test"',
		);
		expect(body).not.toContain('[ ] Autolink headers');
		expect(body).not.toContain('[x] Run');
		expect(() =>
			compile(output, { filename: 'tasks.svelte' }),
		).not.toThrow();
	});

	it('keeps formatting and links inside task-list text', () => {
		const output = compile_document(
			'- [ ] Read **this** [guide](https://example.com)',
		).code;
		expect(output).toContain('aria-label="Read this guide"');
		expect(output).toContain('<strong>this</strong>');
		expect(output).toContain('href="https://example.com"');
	});

	it('renders the three unchecked tasks in Testing MDX', () => {
		const output = compile_document(
			readFileSync('posts/testing-mdx.md', 'utf8'),
		).code;
		const body = output.slice(output.lastIndexOf('</script>'));
		expect(
			body.match(/<input type="checkbox" disabled/g),
		).toHaveLength(3);
		expect(body).not.toContain('disabled checked');
	});

	it('preserves metadata, reading time and sanitised previews', () => {
		const source =
			'---\ndate: 2026-10-03\ntitle: Example\ntags: [svelte]\nis_private: false\n---\n\nHello **world** and [read more](https://example.com).';
		const { metadata } = compile_document(
			source,
			'/posts/example.md',
		);
		expect(metadata).toMatchObject({
			date: '2026-10-03T00:00:00.000Z',
			title: 'Example',
			slug: 'example',
			tags: ['svelte'],
			is_private: false,
			preview: 'Hello world and read more.',
			reading_time: { minutes: 1, words: source.split(/\s+/).length },
		});
		expect(metadata?.previewHtml).toContain('<strong>world</strong>');
		expect(metadata?.previewHtml).toContain('rel="nofollow"');
	});

	it('keeps safe heading links with duplicate IDs', () => {
		const output = compile_document(
			'## Hello **world**\n\n## Hello **world**',
		).code;
		expect(output).toContain('id="hello-world"');
		expect(output).toContain('href="#hello-world"');
		expect(output).toContain('id="hello-world-1"');
	});

	it('resets heading IDs for each document and preserves old code anchors', () => {
		const source =
			'## Add `<channel>` Required Elements\n\n## The `{ h }` is needed';
		const first = compile_document(source).code;
		const second = compile_document(source).code;
		expect(first).toContain('id="add-ltchannelgt-required-elements"');
		expect(first).toContain('id="the-123-h-125-is-needed"');
		expect(second).toBe(first);
	});

	it('sets safe external links without changing local links', () => {
		const output = compile_document(
			'[External](https://example.com) and [Local](/posts)',
		).code;
		expect(output).toContain(
			'href="https://example.com" target="_blank" rel="noopener noreferrer"',
		);
		expect(output).toContain('<a href="/posts">Local</a>');
	});

	it('renders video image links as a player', () => {
		const output = compile_document('![Demo](/demo.mp4)').code;
		expect(output).toContain('<video src="/demo.mp4" controls');
		expect(output).toContain('aria-label="Demo"');
		expect(
			output.slice(output.lastIndexOf('</script>')),
		).not.toContain('<img');
	});

	it('preserves components with Markdown in expression attributes', () => {
		const source =
			'<script>import Demo from "./Demo.svelte";</script>\n\n<Demo\ncontent={`**hello**\\n\\`\\`\\`js\\nconst x = 1;\\n\\`\\`\\``}\n/>';
		const output = compile_document(source).code;
		expect(output).toContain('content={`**hello**');
		expect(() =>
			compile(output, { filename: 'component.svelte' }),
		).not.toThrow();
	});

	const files = globSync([
		'posts/*.md',
		'copy/*.md',
		'newsletter/*.md',
	]).filter((file) => path.basename(file) !== 'README.md');
	it.each(files)('compiles existing content: %s', (filename) => {
		const source = readFileSync(filename, 'utf8');
		const result = compile_document(source, filename);
		expect(result.metadata?.slug).toBe(
			path.basename(filename, '.md'),
		);
		expect(() =>
			compile(result.code, {
				filename,
				generate: 'server',
				experimental: { async: true },
			}),
		).not.toThrow();
	});
});
