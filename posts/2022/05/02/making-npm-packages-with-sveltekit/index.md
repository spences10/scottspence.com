---
date: 2022-05-02
title: Making npm Packages with SvelteKit
tags: ['svelte', 'sveltekit', 'npm']
isPrivate: false
---

I have several components that I use across a couple of my SvelteKit
projects. I decided to make them into an npm package so that I'm not
maintaining them in several places.

Here I'm going to go through the process I followed to develop the
package locally then publish it to npm. So first I should tell you
about the project. I recently published [SvelteKit Embed] on npm and
it's a package of components to embed 3rd party media like YouTube
videos, Tweets and some other embeds into a Svelte project.

## Setting up the project

It's a normal `npm init svelte` project. I initialised it with
TypeScript as that's the expected default for packages these days.

The project is a standalone project with all the components I want to
use from it in the `src/lib/components` folder.

There needs to be a `index.ts` file exporting the components.

```bash
sveltekit-embed/
├─ src/
│  └─ components/
│  └─ index.ts
└─ package.json
```

This will be how the components can be accessed in the project, here's
how they're being exported.

```ts
export { default as AnchorFm } from './components/anchor-fm.svelte'
```

## Package the project

I developed the package locally using the `sveltekit package` command,
then installed it from the resulting `package` folder generated.

```bash
# package with sveltekit
pnpm run package
# install local package
pnpm i -D ./package
```

Now I can validate the components are working locally before
publishing to npm.

## Publish the project to npm

OnceI'm happy with the state of the package, I can publish it to npm.
I'll need to authenticate with npm first with the `npm login` command.

I'll use the `npm version` command to bump the version number, then
run the `sveltekit package` command.

```bash
# authenticate with npm
npm login
# bump version with npm
npm version 0.0.2
# package with sveltekit
pnpm run package
# publish from package directory
```

Then once the package has been created I'll be able to change to the
`package` directory and publish it to npm.

```bash
cd package
npm publish
```

npm will prompt me for my authentication credentials, which is a one
time password (OTP) for 2FA.

Once it's published to npm I can then push the Git tags created to
GitHub and make a release with it.

```bash
# push tags to github
git push --tags
```

## Conclusion

I was able to take all the components I used in several projects and
create an npm package with them for reuse in many projects.

<!-- Links -->

[sveltekit embed]: https://github.com/spences10/sveltekit-embed
