---
date: 2024-01-12
updated: 2024-03-11
title:
  "Fixing 'Component Instantiation' Error in Svelte 5 Tests: A Quick
  Guide"
tags: ['testing', 'svelte', 'guide']
isPrivate: false
---

<script>
  import { Banner } from '$lib/components'
  import { DateDistance } from '$lib/components'

  const options = {
    type: 'info',
    message: `The testing library has been updated. If you're not
      seeing this error in your tests, don't worry. Check 
      out the <a href="#update">update</a> at the end of the post 
      for the simpler approach.
    `
  }
</script>

So, you've just upgraded to Svelte 5 and are excited to test out your
components. But wait, what's this? You run your tests and hit an error
that's throwing a spanner in the works:

```bash
Error: Instantiating a component with 'new' is no longer valid in
Svelte 5. See
https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
for more information.
```

<Banner {options} />

Annoying, right? The solution? Good ol' patch-package. After a bit of
searching I found an issue on the svelte-testing-library repo that
fixes the issue. The solution `patch-package` is a handy tool that
allows you to patch a package and keep the patch in your repo.

## Install and configure patch-package

Install `patch-package` as a dev dependency:

```bash
pnpm i -D patch-package
```

Then to configure it, add `patch-package` to run on your project on
`postinstall`, it's a script to add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

Create a `patches` directory in the root of your project, this is
where the patch file is going to go.

```bash
# create the patches directory
mkdir patches
# create the patch file
touch patches/@testing-library+svelte+4.0.5.patch
```

## Patching the Package

The patch is a diff of the changes you want to make to the package,
full credit to [Stefan Hoelzl](https://github.com/stefanhoelzl) for
the
[patch](https://github.com/testing-library/svelte-testing-library/issues/284)
on the `svelte-testing-library` repo.

```diff
diff --git a/node_modules/@testing-library/svelte/src/pure.js b/node_modules/@testing-library/svelte/src/pure.js
index 04d3cb0..2f041e0 100644
--- a/node_modules/@testing-library/svelte/src/pure.js
+++ b/node_modules/@testing-library/svelte/src/pure.js
@@ -3,7 +3,7 @@ import {
   getQueriesForElement,
   prettyDOM
 } from '@testing-library/dom'
-import { tick } from 'svelte'
+import { tick, createRoot } from 'svelte'

 const containerCache = new Set()
 const componentCache = new Set()
@@ -54,18 +54,15 @@ const render = (
     return { props: options }
   }

-  let component = new ComponentConstructor({
+  let component = createRoot(ComponentConstructor, {
     target,
-    ...checkProps(options)
+    ...checkProps(options),
+    ondestroy: () => componentCache.delete(component)
   })

   containerCache.add({ container, target, component })
   componentCache.add(component)

-  component.$$.on_destroy.push(() => {
-    componentCache.delete(component)
-  })
-
   return {
     container,
     component,
@@ -73,18 +70,14 @@ const render = (
     rerender: (options) => {
       if (componentCache.has(component)) component.$destroy()

-      // eslint-disable-next-line no-new
-      component = new ComponentConstructor({
+      component = createRoot(ComponentConstructor, {
         target,
-        ...checkProps(options)
+        ...checkProps(options),
+        ondestroy: () => componentCache.delete(component)
       })

       containerCache.add({ container, target, component })
       componentCache.add(component)
-
-      component.$$.on_destroy.push(() => {
-        componentCache.delete(component)
-      })
     },
     unmount: () => {
       if (componentCache.has(component)) component.$destroy()
```

Now, to run the patch all you need to do is run the install script on
your project, whatever that is:

```bash
pnpm i
```

The `postinstall` script will run `patch-package` and apply the patch
to the package. Now you can run your tests and they should work as
expected.

## Update

So, <DateDistance date='2024-02-16' /> ago there was an update to the
`svelte-testing-library` package which added support for Svelte 5 on
the `@next` tag for the package.

So, install the package at the `@next` tag:

```bash
pnpm i -D @testing-library/svelte@next
```

Then in any tests that use the `svelte-testing-library` package, I can
update the import to use `svelte5`:

```diff
+import { cleanup, fireEvent, render } from '@testing-library/svelte/svelte5'
-import { cleanup, fireEvent, render } from '@testing-library/svelte'
```

That's it, no need to patch the package anymore.

## References

- https://github.com/testing-library/svelte-testing-library/issues/284
- https://scottspence.com/posts/patching-packages
- https://scottspence.com/posts/patching-gatsby-react-router-scroll
