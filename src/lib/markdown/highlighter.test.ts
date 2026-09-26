import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';
import { highlight_code } from './highlighter.js';

describe('highlight_code', () => {
	it('highlights supported language aliases', () => {
		const output = highlight_code('const value = 42;', 'ts');

		expect(output).toContain('language-ts');
		expect(output).toContain('tok keyword');
		expect(output).toContain('data-language=\\"ts\\"');
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

	it('returns markup that Svelte can compile', () => {
		const output = highlight_code(
			'<button>{count} `tick`</button>',
			'svelte',
		);

		expect(() =>
			compile(output, { filename: 'highlight.svelte' }),
		).not.toThrow();
	});
});
