---
date: 2021-03-13
title: Notes on Toast
tags: ['toast', 'jamstack', 'notes']
isPrivate: false
---

For the past couple of weeks I have slowly been getting a more
comfortable with [Toast]

The best way to do that would be to make a project with it, I decided
to move my blog to Toast.

## Files

The way my Gatsby blog files are organised are a nested structure of
content, posts, YYYY, MM, DD, subject, index.mdx, for this post it
looks like this:

```text
this-project-toast/
├─ content/2021/
│  ├─ 01
│  ├─ 02
│  ├─ 03
│  │  └─ 12/notes-on-toast/
│  │    └─ index.mdx
├─ src/
├─ static/
... more files
```

No more Markdown comments, MDX doesn't support the html comments you
could add into my MDX files so they had to go.

I mainly used html comments to organise my links in my posts, see the
[Markdown Showdown] for more on that if you're interested. I means
that the links I'd have at the bottom of a post wouldn't be labelled
links, resources, images, etc.

```html
<!-- Links -->

[markdown showdown]:
https://scottspence.com/2020/09/17/writing-with-markdown/

<!-- Images -->
```

## Preact

I've used Preact in a project professionally before

```jsx
/** @jsx h */
import { h } from 'preact'
```

## Snowpack

[Snowpack] is a lightweight frontend build tool alternative to webpack
or Parcel. Snowpack leverages JavaScript's native module system,
[ESM].

Snowpack will bundle up the browser modules for me on postinstall

## Cloudinary

Jason Lengstorf created [rehype-local-image-to-cloudinary]

## Tailwind CSS

I've not used Tailwind CSS on a project before so this is a good
learning experience for me

## Resources

- [Intro to Toast]
- [Benjamin Lannon's Portfolio]
- [Tony Alves template]
- [Toast example site Prince]
- [React data viz for use in Toast]
- [Toast starters]

---

[toast]: https://github.com/toastdotdev
[markdown showdown]:
  https://scottspence.com/posts/writing-with-markdown/
[intro to toast]: https://www.mikeallanson.com/intro-to-toast
[benjamin lannon's portfolio]: https://github.com/lannonbr/Portfolio
[tony alves template]: https://github.com/talves/toast-template
[toast example site prince]: https://github.com/maxcell/prince-toast
[react data viz for use in toast]: https://uber.github.io/react-vis/
[toast starters]: https://github.com/toastdotdev/starters
[snowpack]: https://www.snowpack.dev/
[esm]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
