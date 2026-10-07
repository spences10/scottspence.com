import { parse_markdown_svelte } from '@mdsvex/parse';
import { CursorHTMLRenderer } from '@mdsvex/render';

/** Render native PFM without evaluating Svelte code. */
export function render_pfm(source: string) {
	const parsed = parse_markdown_svelte(source);
	if (parsed.errors.size) {
		throw new Error(`Invalid PFM at offset ${parsed.errors.at(0)}`);
	}
	const renderer = new CursorHTMLRenderer({ cache: false });
	renderer.update(parsed.nodes, parsed.source);
	return renderer.html;
}
