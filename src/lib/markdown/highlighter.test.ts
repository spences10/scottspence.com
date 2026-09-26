import { compile as compile_markdown } from 'mdsvex';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';
import mdsvex_config from '../../../mdsvex.config.js';
import { highlight_code } from './highlighter.js';

describe('highlight_code', () => {
	it('highlights supported language aliases', () => {
		const output = highlight_code('const value = 42;', 'ts');

		expect(output).toContain('<CodeBlock ');
		expect(output).toContain('language-ts');
		expect(output).toContain('tok keyword');
		expect(output).toContain('label={"TypeScript"}');
	});

	it('falls back to escaped plain text for unsupported languages', () => {
		const output = highlight_code(
			'<script>alert("no")</script>',
			'powershell',
		);

		expect(output).toContain('language-powershell');
		expect(output).toContain('&lt;script&gt;');
		expect(output).not.toContain('<script>');
	});

	it('renders fences without a language as plain text', () => {
		const output = highlight_code('just text', undefined);

		expect(output).toContain('language-text');
		expect(output).toContain('just text');
		expect(output).not.toContain('label=');
	});

	it('highlights lines from fence meta', () => {
		const output = highlight_code(
			'const a = 1;\nconst b = 2;',
			'js',
			'{2}',
		);

		expect(output).toContain('has-highlight');
		expect(output).toContain('l highlight');
	});

	it('renders line numbers and a keyboard scrollable block', () => {
		const output = highlight_code('a\nb', 'ts');

		expect(output).toContain('class=\\"ln\\">2<');
		expect(output).toContain('tabindex=\\"0\\"');
	});

	it('sizes the line number column to the largest number', () => {
		expect(highlight_code('a\nb', 'ts')).toContain('digits={1}');
		expect(
			highlight_code(Array(12).fill('a').join('\n'), 'ts'),
		).toContain('digits={2}');
		expect(
			highlight_code('a\nb', 'ts', ':line-numbers=99'),
		).toContain('digits={3}');
	});

	it('passes a logo path for languages with one', () => {
		expect(highlight_code('x', 'svelte')).toMatch(
			/icon=\{"M[^"]+"\}/,
		);
		expect(highlight_code('x', 'sh')).toMatch(/icon=\{"M[^"]+"\}/);
	});

	it('omits the logo for languages without one', () => {
		expect(highlight_code('x', 'powershell')).not.toContain('icon=');
		expect(highlight_code('x', undefined)).not.toContain('icon=');
	});

	it('returns markup that Svelte can compile', () => {
		const output = highlight_code(
			'<button>{count} `tick`</button>',
			'svelte',
		);

		expect(() =>
			compile(
				`<script>import CodeBlock from './code-block.svelte';</script>${output}`,
				{ filename: 'highlight.svelte' },
			),
		).not.toThrow();
	});
});

describe('code block import', () => {
	const count_imports = (code: string) =>
		code.match(/import CodeBlock from/g)?.length ?? 0;

	it('adds a script with the import when a file has none', async () => {
		const result = await compile_markdown(
			'# Post\n\n```js\nconst a = 1;\n```\n',
			mdsvex_config,
		);

		expect(count_imports(result!.code)).toBe(1);
		expect(result!.code).toContain('<CodeBlock ');
	});

	it('reuses an existing instance script', async () => {
		const result = await compile_markdown(
			'<script lang="ts">\n\tconst x = 1;\n</script>\n\n```ts\nconst a = 1;\n```\n',
			mdsvex_config,
		);

		expect(count_imports(result!.code)).toBe(1);
		expect(result!.code.match(/<script lang="ts">/g)).toHaveLength(1);
	});

	it('leaves files without code alone', async () => {
		const result = await compile_markdown(
			'# No code here\n',
			mdsvex_config,
		);

		expect(count_imports(result!.code)).toBe(0);
	});
});
