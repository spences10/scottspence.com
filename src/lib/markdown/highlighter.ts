import type { HighlightOptions } from 'mdsvex/highlight';

// mdsvex loads its bundled twinkleplop languages once, on first use.
// Keep the site's additional fence names alongside the built-in aliases.
export const highlight_options: HighlightOptions = {
	languages: {
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
