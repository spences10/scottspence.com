---
date: 2020-11-01
title: Patching Gatsby React Router Scroll with patch-package
tags: ['learning', 'guide', 'resource']
isPrivate: false
---

This is a very specific issue myself and anyone that uses Gatsby and
React router for navigating between headers in their Gatsby sites.

The issue has been [documented] several times now and the advice I
have followed is to add a [resolutions to my `package.json` file].

I've found using this approach didn't give very consistent results so
I decided to use patch package again after seeing a [comment] from
[lukekarrys] on the GitHub asking others to confirm if his approach
(using patch package) worked.

## Fix broken node modules, instantly

I've documented this [in the past] and I think this is a great way to
fix the issue yourself until the package maintainer gets round to
fixing it for everyone else.

This is the same approach for any package you want to amend, in this
case it's for `gatsby-react-router-scroll`.

⚠ Note: this is for version "3.0.15" of `gatsby-react-router-scroll`.

## Step 1, install dependencies

To use patch this package I'm going to need to install `patch-package`
and `postinstall-postinstall` as development dependencies.

```bash
yarn add -D patch-package postinstall-postinstall
```

**FYI:** `postinstall-postinstall` is needed [specifically for yarn].

## Step 2, remove the resolutions

As I was using the resolutions fix prior to this I'm going to need to
remove it from my `package.json`.

```git
-  "resolutions": {
-    "gatsby-react-router-scroll": "3.0.3"
-  }
```

Now that the resolutions are removed I'll run yarn again to install
the latest version of `gatsby-react-router-scroll` ready for patching.

⚠⚠ at the time of writing this it's at version "3.0.15". ⚠⚠

## Step 3, change the package

Now to change the package in line with Luke's [comment], the file I
need to change is located my `node_modules` folder here:

```text
gatsby-react-router-scroll/scroll-handler.js
```

And the change is removing `&& scrollPosition === 0` from the
`scroll-handler.js` file (line 107).

```git
-  if (hash && scrollPosition === 0) {
+  if (hash) {
     this.scrollToHash(decodeURI(hash), prevProps);
   } else {
     this.windowScroll(scrollPosition, prevProps);
```

## Step 4, patch the package

Now I want to save this and make it permanent, to patch it, I'll run
`patch-package` specifying the package I want to patch:

```bash
yarn patch-package gatsby-react-router-scroll
```

This creates a `patches` folder with the git diff in there of the
change I made, it also details the package version in the filemane.

Now if I upgrade `gatsby-react-router-scroll` and the changes I have
made are irrelevant then patch package will give me a warning asking
me if I want to keep the changes or not. I can then decide if I want
to delete the patch or not.

## Step 5, postinstall script

Now that's all done for what I have in my `node_modules` but what if I
were to delete the `node_modules` folder? This is where patch package
comes in, because so far all I've done is change the package locally
and use patch package to generate the diff between hte two.

Finally add `patch-package` to the `postinstall` script in my
`package.json`:

```git
"scripts": {
  "dev": "gatsby develop",
-  "build": "gatsby build"
+  "build": "gatsby build",
+  "postinstall": "patch-package"
},
```

This will ensure that the changes I've made are applied each time the
project is `yarn` installed.

So if I delete my `node_modules` folder then `yarn` install the
changes in the `.patch` file will be applied to the
`gatsby-react-router-scroll` package post install.

## Watch me do it on Twitch

Here's a [livestream] of me applying the changes with bonus happy
dance!

## Done!

So to wrap up I've manually changed one of the dependency packages of
Gatsby.

I detailed finding and patching a `node_modules` package that I didn't
want to wait to be patched so applied the change myself with patch
package.

If someone clones the project then their instance of the
`gatsby-react-router-scroll` package will be patched with the changes
I have made.

Please remember to [subscribe] if you haven't done so already so you
can get updates when I [go live] and release new content.

<!-- Links -->

[documented]: https://github.com/gatsbyjs/gatsby/issues/25778
[resolutions to my `package.json` file]:
  https://scottspence.com/posts/smooth-scroll-toc-gatsby/#not-scrolling-to-id
[comment]:
  https://github.com/gatsbyjs/gatsby/issues/25778#issuecomment-696950384
[lukekarrys]: https://github.com/lukekarrys
[in the past]: https://scottspence.com/posts/patching-packages/
[specifically for yarn]:
  https://www.npmjs.com/package/patch-package#why-use-postinstall-postinstall-with-yarn
[livestream]: https://www.twitch.tv/videos/777497800?t=00h29m52s
[subscribe]: http://ss10.dev/yt?sub_confirmation=1
[go live]: http://ss10.dev/twitch
