---
date: 2022-05-02
title: Making npm Packages with Sveltekit
tags: ['svelte', 'sveltekit', 'npm']
isPrivate: true
---

I have several components that I use across a couple of my SvelteKit
projects. I decided to make them into an npm package so that I'm not
maintaining them in several places.

Here I'm going to go through the process I followed to develop the
package locally then publish it to npm.

```bash
# authenticate with npm
npm login
# bump version with npm
npm version 0.0.2
# package with sveltkit
pnpm run package
# publish from package directory
cd package
npm publish
# install local package
pnpm i -D ./package
# push tags to github
git push --tags
```
