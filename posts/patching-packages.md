---
date: 2020-05-04
title: Patching Packages with patch-package
tags: ['learning', 'guide']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

I found an opportunity to improve the npm package for the
_`Victor Mono`_ font I like to use here and in my text editor (much to
people horror when they see it)!

It was a simple fix to add `font-display: swap;` to the css file in
the dist package.

The maintainer was super responsive and added the change straight away
which was cool, that doesn't mean that the changes are going to be
packaged up and released that quickly.

Looking at the [releases] it could be a while before this gets
published to npm so I decided to give patch-package a try.

## Video on patch-package

<!-- cSpell:ignore awad -->

[Ben Awad] had a great video on how to use it with an example, check
it out here:

<YouTube youTubeId="2AVs-Yh1bS8" />

## Install

I'm using Yarn so I installed both patch-package and
postinstall-postinstall:

```bash
yarn add -D patch-package postinstall-postinstall
```

## Make the change

In this case I want to change my `victormono` package, so, I can find
it in the `node_modules`.

Check the `package.json` for the `"main"` file, Victor Mono is quite a
simple project so there's just the one `dist/index.css` I can take the
changes made [to the GitHub project] and add them to my version of the
package.

## Patch it

Now I have the change locally on my machine I want to keep them
around, if I push what I have currently a build process will install
from the registry which doesn't have the fix.

I need to tell patch-package what package I want to patch:

```bash
yarn patch-package victormono
```

Then patch-package will create a `patches` folder in the root of my
project where I can inspect the patch changes.

```bash
this-project/
  └─ patches/
    └─ victormono+1.3.1.patch
```

## View the patch

Opening the `.patch` file displays the changes made:

```git
diff --git a/node_modules/victormono/dist/index.css b/node_modules/victormono/dist/index.css
index 82c84f1..9e1131f 100644
--- a/node_modules/victormono/dist/index.css
+++ b/node_modules/victormono/dist/index.css
@@ -4,6 +4,7 @@
        url("woff/VictorMono-Regular.woff") format("woff");
   font-weight: 400;
   font-style: normal;
+  font-display: swap;
 }

 @font-face {
@@ -12,6 +13,7 @@
        url("woff/VictorMono-Italic.woff") format("woff");
   font-weight: 400;
   font-style: italic;
+  font-display: swap;
 }

 @font-face {
@@ -20,6 +22,7 @@
        url("woff/VictorMono-Bold.woff") format("woff");
   font-weight: 700;
   font-style: normal;
+  font-display: swap;
 }

 @font-face {
@@ -28,4 +31,5 @@
        url("woff/VictorMono-BoldItalic.woff") format("woff");
   font-weight: 700;
   font-style: italic;
+  font-display: swap;
 }
\ No newline at end of file
```

> If you have Prettier installed and set to format on save use
> Ctrl+Shit+p and select `File: Save without Formatting` when changing
> other packages

Saving without formatting on the package you want to change will make
the `.patch` file less noisy only including the relevant changes.

## Use postinstall

I've added postinstall-postinstall to run patch-package, this will
mean that the patch file created by patch-package gets applied after
the project is built.

```json
"scripts": {
  "postinstall": "patch-package"
},
```

I can now publish my project with the patches until the Victor Mono
npm package changes. At that time I will get a prompt to tell me the
package has changed probably via a failed build, then I can either
change my patch or remove it completely.

<!-- Links -->

[github issue]: https://github.com/rubjo/victor-mono/issues/77
[releases]: https://github.com/rubjo/victor-mono/releases
[ben awad]: https://www.youtube.com/channel/UC-8QAzbLcRglXeN_MY9blyw
[to the github project]:
  https://github.com/rubjo/victor-mono/commit/f6a7ed793d37a281674d794b630ce16a1303899e
