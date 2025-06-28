---
date: 2025-06-28
title: Shared Tailwind CSS Themes in Svelte Monorepos
tags: ['sveltekit', 'tailwind', 'monorepo', 'how-to']
is_private: false
---

<!-- cspell:ignore Stroybook jeppe repro -->

I'm currently in the process of migrating a _large_ SvelteKit monorepo
from Svelte 4 to Svelte 5 with my team. The UI package is still on
Svelte 4 and it's causing a lot of headaches with svelte-check in CI
and the `on:click` and `onclick` event delegation (UI package is
Svelte 4 so a button click event in a Svelte 5 project confuses things
slightly). So, I'm updating the UI package to Svelte 5 in a new Svelte
5 package, plus everything is still on Tailwind v3.

Anyways! Whilst creating a new UI package in Svelte 5 also seems like
the opportune time to migrate to Tailwind v4 from Tailwind v3, right,
right? 😅

So, whilst migrating all the existing components from Svelte 4 to
Svelte 5, (Chris Ellis did most of this with Claude Code actually!
I'lll mostly be copy pasting!) it makes sense that that components use
Tailwind v4 at the same time! So, that's a package for the UI and a
package for the Tailwind theme!

Ok, whilst I'm at it I may as well move where the components are
currently viewed as well, from the current home where they live in a
MDSveX SvelteKit app over to Stroybook! Makes sense right?? 😅😅

So, that's the setup! Two new packages and one new app! Stroybook
makes sense to me because the stories are self documenting and there's
minimal need for additional changes if the component changes. All the
tests and a11y testing can be done in Stroybook meaning there's zero
unit tests needed in the client apps!

Classic plate spinning situation - you know that Malcolm in the Middle
gif where Hal goes to change a lightbulb and ends up fixing the entire
car? That's my life right now!

Ok, set up Stroybook in a new app, I followed the `sv` CLI options to
create a new UI package with the classic button as the only component,
export that for use in Stroybook and the theme, then create the
Tailwind theme package too!

The Tailwind theme package is literally two files in a folder! If
you're interested look at the reference repo
[svelte-storybook-tailwind-monorepo](https://github.com/spences10/svelte-storybook-tailwind-monorepo/blob/main/packages/tailwind-theme/src/theme.css),
create the `theme.css` file:

```css
@theme {
	/* Custom color palette */
	--color-brand-50: #eff6ff;

	/* loads of other stuff */
}
```

and a `package.json`:

```json
{
	"name": "@some-org/tailwind-theme",
	"version": "0.1.0",
	"type": "module",
	"exports": {
		"./theme.css": "./src/theme.css"
	},
	"files": ["src"]
}
```

So, my smooth brain now interprets this as "I can just import the
`@some-org/tailwind-theme/theme.css` file in my SvelteKit app and
everything will work, right?" not quite! So, I've got the button from
the UI package imported into Stroybook, that _should_ "just work" with
the picking up the Tailwind classes now?? It does not!

Turns out it wasn't Storybook at all (sorry Storybook, I blamed you
first). The issue was with how Tailwind v4 handles theme sharing in
monorepos.

But here's the thing - in a massive monorepo, literally anything could
be causing the issue. Some random config file, build order problems,
Storybook weirdness, you name it. I was getting tunnel vision trying
to debug it in place.

## The minimal repro breakthrough

I should have done this from the start, but hindsight, right? I
created a minimal reproduction repo to isolate the problem. And boom -
immediately obvious what was happening.

In the minimal repro, I went straight to adding the UI component into
the `main-app` instead of trying to isolate it in Storybook first
(which is what I was doing in the monorepo). Sometimes you get so
focused on the immediate thing you're working on that you miss the
obvious debugging step.

Here's the thing that took forever to work out and exactly why I'm
blogging about it: `@source '../../*/src/**/*.{svelte,js,ts}';`

That single line is the key to making shared Tailwind v4 themes work
in a monorepo. After a lot of back and forth with Claude (who kept
defaulting to Tailwind v3 solutions), we eventually found this v4
approach.

## When to use this approach

This setup makes sense when you have:

- Multiple apps that need consistent theming
- Shared component libraries
- Complex design systems with lots of custom tokens
- Teams that need to maintain design consistency

It's probably overkill for simple projects. But if you're dealing with
a large monorepo where design consistency matters, this approach works
really well.

## The repository

I've published the minimal reproduction at
[github.com/spences10/svelte-storybook-tailwind-monorepo](https://github.com/spences10/svelte-storybook-tailwind-monorepo).
You can clone it and see exactly how everything fits together.

The key files to look at:

- `packages/tailwind-theme/src/theme.css` - The magic `@source`
  directive
- `apps/main-app/src/app.css` - How apps import the theme
- `packages/ui/src/lib/Button.svelte` - Using theme variables in
  components

## The real issue: utility class discovery

Here's what actually happens when you remove the `@source` directive.
Theme colors work fine for direct utility usage:

```svelte
<!-- This works perfectly -->
<div class="bg-brand-500 p-4 text-white">
	Direct utility classes work fine!
</div>
```

But your UI package components break:

```svelte
<!-- This component loses all its styles -->
<Button variant="primary">Broken button</Button>
```

## Why this happens

The issue isn't with importing CSS - that works fine. The problem is
**utility class discovery**. Here's the step-by-step breakdown:

**With the `@source` directive:**

1. Tailwind scans `../../*/src/**/*.{svelte,js,ts}`
2. Finds your `Button.svelte` with classes like
   `bg-brand-600 hover:bg-brand-700`
3. Generates those utility classes in the final CSS
4. Button components work ✅

**Without the `@source` directive:**

1. Tailwind only processes the current app's templates
2. **Never scans the UI package's** `Button.svelte`
3. Never generates `bg-brand-600`, `hover:bg-brand-700`, etc.
4. Button components have no styles ❌
5. But direct usage like `<div class="bg-brand-500">` still works
   because Tailwind sees it in the current app

The key insight: **Tailwind needs to know which classes to generate**.
Without `@source`, it has no idea your UI package components are using
those brand utility classes.

## Why utility-first components need @source

Our Button component uses runtime class composition:

```typescript
// packages/ui/src/lib/Button.svelte
const variantClasses = {
	primary:
		'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
	secondary:
		'bg-brand-100 text-brand-900 hover:bg-brand-200 active:bg-brand-300',
}
```

This is **utility-first design** - composing styles from atomic
utility classes. It's why we use Tailwind instead of plain CSS! But
for this to work, Tailwind must:

1. **Know these classes are used** (via `@source` scanning)
2. **Generate them** in the final CSS bundle

Without `@source`, Tailwind never sees your Button component's
template, so it never generates the brand utility classes your
components depend on.

## The alternative: @layer components (but why would you?)

You could avoid `@source` by using the `@layer components` approach:

```css
@layer components {
	.btn-primary {
		@apply bg-brand-500 rounded-lg px-4 py-2 text-white;
	}
}
```

Then your component would use `class="btn-primary"` instead of dynamic
utility composition. But honestly, if I wanted to write `.btn-primary`
classes, I'd just use regular CSS. The whole point of Tailwind is the
utility-first approach!

## So the @source directive stays

The `@source` directive is **essential** for utility-first component
libraries in monorepos. It's not a hack or workaround - it's the
correct way to tell Tailwind about cross-package utility usage.

**When you need @source:**

- Utility-first component libraries
- Dynamic class composition
- Shared components across packages
- Runtime variant switching

**When you might not need @source:**

- Traditional component-first CSS with `@layer components`
- Single-package applications
- Static utility classes only

## Why the @source directive is essential

The `@source` directive is how Tailwind knows which utility classes to
generate. Without it, Tailwind only scans the current app's files and
never discovers the classes used in your UI package components.

This isn't a hack or workaround - it's the correct way to handle
utility-first component libraries in monorepos. The magic glob pattern
is exactly what you need.

## Performance optimizations with exclusions

One thing I discovered whilst working on this is that you can improve
build performance by excluding files that definitely won't contain
Tailwind classes. Test files, config files, and type definitions are
prime candidates for exclusion.

Here's what I added to the theme package:

```css
/* The main source scanning */
@source '../../*/src/**/*.{svelte,js,ts}';

/* Exclude files that won't have Tailwind classes */
@source not '../../*/src/**/*.test.{js,ts}';
@source not '../../*/src/**/*.spec.{js,ts}';
@source not '../../*/src/**/*.config.{js,ts}';
@source not '../../*/src/**/*.d.ts';
```

The `@source not` directive tells Tailwind to skip these files during
scanning. In a large monorepo, this can make a noticeable difference
to build times because you're not scanning hundreds of test files and
type definitions that will never contain utility classes.

**Why include JS/TS files at all?** Because your component logic often
defines classes in TypeScript:

```typescript
const variantClasses = {
	primary: 'bg-brand-600 text-white hover:bg-brand-700',
	secondary: 'bg-brand-100 text-brand-900 hover:bg-brand-200',
}
```

Tailwind treats all files as plain text (no code parsing), so the
performance cost is minimal, but the class discovery is essential.

## Conclusion

The `@source` directive with glob patterns is the correct solution for
sharing Tailwind v4 themes in utility-first monorepos. It's not a
hack - it's how you tell Tailwind about cross-package utility usage.

Key takeaways:

- **Import CSS for theme variables** - works great for design tokens
- **Use @source for utility discovery** - essential for component
  libraries
- **Optimize with exclusions** - exclude test/config files for better
  performance
- **Embrace utility-first** - that's why we're using Tailwind!

The next time you're setting up a monorepo with shared Tailwind v4
themes, remember: import the CSS for design tokens, use `@source` for
utility discovery, and optimize with exclusions. It'll save you the
debugging I went through!
