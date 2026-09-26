import { language as bash } from '@twinkleplop/bash';
import { language as css } from '@twinkleplop/css';
import { language as diff } from '@twinkleplop/diff';
import { language as dotenv } from '@twinkleplop/dotenv';
import { language as html } from '@twinkleplop/html';
import { language as ini } from '@twinkleplop/ini';
import { language as javascript } from '@twinkleplop/javascript';
import { language as json } from '@twinkleplop/json';
import { language as markdown } from '@twinkleplop/markdown';
import { create_renderer } from '@twinkleplop/markdown-core';
import { language_icon, language_label } from './language-icons.js';
import { language as python } from '@twinkleplop/python';
import { language as sql } from '@twinkleplop/sql';
import { language as svelte } from '@twinkleplop/svelte';
import { language as tsx } from '@twinkleplop/tsx';
import { language as typescript } from '@twinkleplop/typescript';
import { language as yaml } from '@twinkleplop/yaml';

// Fence names without a registered grammar (graphql, powershell,
// dockerfile, text, etc.) render as escaped plain text in the same
// block markup.
const renderer = create_renderer({
	languages: {
		bash: bash(),
		css: css(),
		diff: diff(),
		dotenv: dotenv(),
		html: html(),
		ini: ini(),
		javascript: javascript(),
		json: json(),
		markdown: markdown(),
		python: python(),
		sql: sql(),
		svelte: svelte(),
		tsx: tsx(),
		typescript: typescript(),
		yaml: yaml(),
		conf: 'ini',
		env: 'dotenv',
		git: 'diff',
		js: 'javascript',
		jsx: 'tsx',
		md: 'markdown',
		mdx: 'markdown',
		mjs: 'javascript',
		py: 'python',
		sh: 'bash',
		shell: 'bash',
		ts: 'typescript',
		yml: 'yaml',
		zsh: 'bash',
	},
	on_unknown_language: 'plain',
	// Always rendered, readers toggle visibility in CodeBlock
	line_numbers: true,
	// Lets keyboard users scroll wide code blocks
	render: { attributes: { tabindex: 0 } },
});

// `js:title` style suffixes aren't a twinkleplop convention, drop them
function normalise_language(language?: string | null) {
	const value = language?.toLowerCase().split(':', 1)[0];
	return value?.replaceAll(/[^a-z0-9_-]/g, '-') || 'text';
}

/**
 * mdsvex highlighter. Fence meta supports the Shiki/VitePress
 * conventions, e.g. `{1,3-4}` line highlights and `title="file.ts"`.
 * Emits a CodeBlock, the import is added by the remark plugin in
 * mdsvex.config.js.
 */
export function highlight_code(
	code: string,
	language?: string | null,
	meta?: string | null,
) {
	const normalised = normalise_language(language);
	const html = renderer.fence(normalised, meta ?? undefined, code);
	const icon = language_icon(normalised);
	const label =
		normalised === 'text' ? '' : language_label(normalised);

	// Pass as string expressions so Svelte doesn't parse `{` or `<`
	// in the highlighted source as template syntax
	const props = [
		`html={${JSON.stringify(html)}}`,
		label && `label={${JSON.stringify(label)}}`,
		icon && `icon={${JSON.stringify(icon)}}`,
	];

	return `<CodeBlock ${props.filter(Boolean).join(' ')} />`;
}
