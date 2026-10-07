import type {
	HighlightOptions,
	LanguageModule,
} from 'mdsvex/highlight';
import type { Warning } from 'svelte/compiler';

// Use the native renderer, including escaping and line numbers, without tokens.
const plain: LanguageModule = {
	tokenize: () => () => ({
		tokens: new Uint32Array(0),
		token_types: [],
	}),
};

// Named scrollable code regions need keyboard focus. Only ignore this false
// positive on generated pre elements; authored markup keeps all a11y checks.
export function code_block_warning_filter(source: string) {
	return (warning: Warning) => {
		if (
			warning.code !== 'a11y_no_noninteractive_tabindex' ||
			!warning.start ||
			!warning.end
		) {
			return true;
		}
		const element = source.slice(
			warning.start.character,
			warning.end.character,
		);
		return !/^<pre class="twinkleplop(?: [^"]*)?" tabindex="0" role="region" aria-label="Code example"/.test(
			element,
		);
	};
}

// mdsvex loads its bundled twinkleplop languages once, on first use.
// Keep the site's additional fence names alongside the built-in aliases.
export const highlight_options: HighlightOptions = {
	languages: {
		text: plain,
		txt: 'text',
		plaintext: 'text',
		nano: 'text',
		url: 'text',
		conf: 'ini',
		docker: 'dockerfile',
		git: 'diff',
		mdx: 'markdown',
		ps: 'powershell',
	},
	on_unknown_language: 'plain',
	// Always rendered, readers toggle visibility in CodeBlock.
	line_numbers: true,
	// Keyboard focus is needed to scroll wide code blocks. Svelte currently
	// warns about tabindex on pre, even for this named scrollable region.
	render: {
		attributes: {
			tabindex: 0,
			role: 'region',
			'aria-label': 'Code example',
		},
	},
};
