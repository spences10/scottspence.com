---
date: 2024-05-11
title: Patching packages with pnpm patch
tags: ['learning', 'guide', 'pnpm', 'patch']
isPrivate: false
---

I'm currently looking into upgrading a large app where I'm working, to
upgrade from Svelte 4 to Svelte 5. The upgrade from 4-5 wasn't as much
of a problem as I thought it would be, there was one issue with
another Svelte package that I discovered I could patch.

In the past if I've needed to patch a package I've used
`patch-package`, which I've detailed here previously with
[Patching Packages with patch-package](https://scottspence.com/posts/patching-packages).

The drawback with using `patch-package` is, there's the initial
install of the package then adding in a postinstall script to run the
patch. With pnpm this is built into the package manager.

## Patch a package with pnpm patch

So, it's pretty straightforward but I got a bit lost after the initial
command. 😅

To patch a package with pnpm you first need to specify the package and
the version you want to patch.

Ok, say I want to patch the `svead` package to include an `alt`
attribute on the `<meta>` tag.

The version installed is `0.0.4` so I'll use that in the command:

```bash
pnpm patch svead@0.0.4
```

That gives the following output:

```text
You can now edit the following folder: /tmp/ff5c69981b5e3c7d541f32db5546a177

Once you're done with your changes, run "pnpm patch-commit '/tmp/ff5c69981b5e3c7d541f32db5546a177'"
```

So, this was the bit that initially confused me as I was looking the
the `tmp` folder in the project and not my filesystem. 😅

Anyway, simplest way I found was to use VS Code to open the folder:

```bash
code /tmp/ff5c69981b5e3c7d541f32db5546a177
```

That opens up the folder in VS Code, I can then edit the file and
commit the changes.

So, in this contrived example I want to add an `alt` attribute to the
existing package, so I'll add in the following code:

```diff
  <meta property="og:url" content={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
+ <meta property="og:image:alt" content={description} />
```

Then as detailed in the initial `patch` command I can run the commit
command:

```bash
pnpm patch-commit '/tmp/ff5c69981b5e3c7d541f32db5546a177'
```

Now the project that has the `svead` package installed will now have a
`patches` folder in the root of the project with the patch file
`svead+0.0.4.patch`.

Taking a quick look at that details the changes made to the package:

```git
diff --git a/components/head.svelte b/components/head.svelte
index e932bbf1ffa795c081292bc669640f75d434ebfc..a63aef8c4beab3aec901ffd6a07ace0e0db845d8 100644
--- a/components/head.svelte
+++ b/components/head.svelte
@@ -44,6 +44,7 @@ export let paymentPointer = ''; // Web Monetisation Payment pointer
 		<meta property="og:title" content={title} />
 		<meta property="og:description" content={description} />
 		<meta property="og:image" content={image} />
+		<meta property="og:image:alt" content={description} />
 	{/if}
```

In the `package.json` there's been a `pnpm` section added with a
`patchedDependencies` object. This is where the patch file is
referenced.

```json
"pnpm": {
  "patchedDependencies": {
    "svead@0.0.4": "patches/svead@0.0.4.patch"
  }
}
```

Now I can commit that and get on with my day! 🥳

## patch-remove

If the `svead` package gets updated in the future I can use the
`patch-remove` command to remove the patch:

```bash
pnpm patch-remove svead@0.0.4
```

If the changes I made still need to be applied then I can go through
the same process as before for the new version.

## Conclusion

Using pnpm for patching packages removes the need for additional tools
like `patch-package` and `postinstall` scripts and automates the
application of patches during the installation.

This approach helps with maintainability but also contributes to a
more efficient development workflow, especially in complex projects or
monorepos.
