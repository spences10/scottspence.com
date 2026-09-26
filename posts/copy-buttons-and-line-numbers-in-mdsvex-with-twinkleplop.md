---
date: 2026-09-22
title: Copy Buttons and Line Numbers in mdsvex With twinkleplop
tags: ['sveltekit', 'markdown', 'guide']
is_private: false
---

<!-- cSpell:ignore mdsvex twinkleplop pngwn Prism VitePress Shiki tabindex remark unist hydration unshift -->

I've had syntax highlighting on this blog since I moved it over to
mdsvex back in 2021. What I've never had are the controls: a button to
copy the code, highlighted lines, or line numbers you can turn on and
off.

I've finally sorted all three. Very good, I'm happy with the result!
😅

This post covers how I swapped Prism for
[twinkleplop](https://twinkleplop.pngwn.at), then built a code block
component around it. If you're reading this on the site, every code
block in the post is using it. Try the buttons in the top right of
this one:

```ts {3}
import { language } from '@twinkleplop/typescript';

const typescript = language();
const html = typescript('const answer = 42;');
```

## Why I switched

mdsvex ships with Prism, and Prism did the job for years. The thing
that pushed me over was finding out that 52 code fences across 16 of
my posts had line highlight markers like `{2,7}` on them. Prism had
been quietly ignoring every one of them. I'd added those markers,
never seen them work, and stopped bothering.

twinkleplop is a syntax highlighter from
[pngwn](https://github.com/pngwn). It runs at build time, so none of
the highlighter ends up in the browser, there's a package per
language, and themes are CSS custom properties. I went with the Night
Owl theme, which is what I had with Prism anyway.

The piece that made it a good fit for mdsvex is
`@twinkleplop/markdown-core`. It reads the fence metadata that Shiki
and VitePress use, so `{2,7}` line highlights, `title="file.ts"` and
`:line-numbers` all work without me writing a parser.

## The highlighter

mdsvex can swap its highlighter for a function that takes the code,
the language and the fence metadata. Mine creates a twinkleplop
renderer with the languages I use:

```ts {12-14}
import { create_renderer } from '@twinkleplop/markdown-core';
import { language as bash } from '@twinkleplop/bash';
import { language as typescript } from '@twinkleplop/typescript';
import { language as svelte } from '@twinkleplop/svelte';

const renderer = create_renderer({
	languages: {
		bash: bash(),
		typescript: typescript(),
		svelte: svelte(),
		ts: 'typescript',
		sh: 'bash',
	},
	on_unknown_language: 'plain',
	line_numbers: true,
});
```

The highlighted lines there are the ones worth knowing about. Aliases
map `ts` and `sh` onto the full language names, and
`on_unknown_language: 'plain'` renders anything without a grammar as
escaped plain text instead of failing the build. I've got GraphQL,
PowerShell and Dockerfile fences in old posts, and there aren't
twinkleplop packages for those yet.

`line_numbers: true` renders the numbers into every block. More on why
in a bit.

Then it goes into the mdsvex config:

```js
import { highlight_code } from './src/lib/markdown/highlighter.ts';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],
	highlight: {
		highlighter: highlight_code,
	},
});
```

## The catch with controls

This is the reason I never added a copy button before. An mdsvex
highlighter returns a string, and that string ends up in the page as
one opaque blob of HTML. There's no component to put a button on.

The way round it was to have the highlighter return a Svelte component
instead of HTML, with the highlighted HTML passed in as a prop:

```ts {6}
export function highlight_code(code, language, meta) {
	const html = renderer.fence(language, meta, code);

	// Pass as string expressions so Svelte doesn't parse `{` or `<`
	// in the highlighted source as template syntax
	return `<CodeBlock html={${JSON.stringify(html)}} />`;
}
```

That `JSON.stringify` matters. Highlighted Svelte code is full of
curly braces, and if they went straight into the template Svelte would
try to evaluate them.

That leaves one problem: every post with a code block now uses
`CodeBlock`, and every post needs to import it. I'm not adding an
import to 240 posts by hand, so a small remark plugin does it:

```js {16-20}
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
```

Remark plugins run before mdsvex highlights anything, so the plugin
can still see the code fences. A lot of my posts already have their
own `<script>` block, and a component can only have one, so the plugin
adds the import to an existing script if there is one. The `code`
nodes are the fences themselves, which means `<script>` tags inside
code examples don't confuse it.

## Copying without the line numbers

The copy button clones the code, drops the line numbers and copies
what is left:

```ts {5-6}
async function copy_code() {
	const code = block?.querySelector('pre code');
	if (!code) return;

	const clone = code.cloneNode(true) as HTMLElement;
	clone.querySelectorAll('.ln').forEach((ln) => ln.remove());

	try {
		await navigator.clipboard.writeText(clone.textContent ?? '');
		copy_status = 'Copied';
	} catch {
		copy_status = 'Copy failed';
	}
}
```

I checked this against a 14 line block and got 14 clean lines back,
tabs and blank lines included. The icon swaps to a tick for a couple
of seconds, and a hidden status message tells screen readers it
copied.

## Line numbers without the flash

Line numbers are always in the markup and hidden with CSS. The toggle
flips a `data-line-numbers` attribute on `<html>`, so one click turns
them on for every block on the page:

```css
.twinkleplop .ln {
	display: none;
	user-select: none;
}

[data-line-numbers] .twinkleplop .ln {
	display: inline-block;
}
```

`user-select: none` stops the numbers getting caught when someone
highlights code by hand.

To remember the setting between visits I copied what my theme picker
already does. The toggle saves a cookie, and a server hook adds the
attribute before the page is sent:

```ts
export const line_numbers: Handle = async ({ event, resolve }) => {
	const visible = event.cookies.get('line_numbers') === '1';

	return await resolve(event, {
		transformPageChunk: ({ html }) =>
			visible
				? html.replace('<html ', '<html data-line-numbers ')
				: html,
	});
};
```

Reading it from local storage in the browser would work too, but the
numbers would pop in after the page loaded. With the hook they're
there on first paint.

## Language icons

The header shows a small logo for the language, with the name in a
tooltip. The logos are paths from
[Simple Icons](https://simpleicons.org), and the highlighter looks up
the right one at build time and passes it to `CodeBlock` as a prop.
That way each post only ships the logos it actually uses, rather than
every post downloading all of them.

I hand-rolled the copy and line number icons too. For three icons it
came out smaller than pulling in an icon package.

## Highlights that go edge to edge

The last bit was alignment. The prose styles put padding on the
`<pre>`, so highlighted lines stopped short of the edges. Moving the
padding onto each line and laying the lines out as a grid fixed it:

```css
.twinkleplop code {
	display: grid;
	min-width: 100%;
	width: max-content;
}

.twinkleplop .l {
	min-height: 1lh;
	padding-inline: var(--code-gutter, 1.5rem);
}
```

`width: max-content` means a highlight follows the line when a long
block scrolls sideways, and `min-height: 1lh` stops blank lines
collapsing. The header uses the same gutter variable, so the language
icon sits in line with the code and the copy button's icon lines up
with the right-hand edge.

## Wrapping up

That's it! Syntax highlighting that runs at build time, a copy button,
line highlights that finally work, and line numbers that remember a
reader's choice. All of it comes down to one change: the highlighter
returns a component instead of a string.

The whole thing is in the
[repo for this site](https://github.com/spences10/scottspence.com).
