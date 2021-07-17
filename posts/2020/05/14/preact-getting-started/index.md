---
date: 2020-12-31
title: Getting started with Preact and the Preact CLI
tags: ['learning', 'guide']
isPrivate: true
---

For the past couple of weeks now I have been getting familiar with
Preact and the Preact CLI.

It's great, it's _similar_ to React

## The `{ h }` isn't needed

I was quite hung up on the `{ h }` import, I use the VSCode setting to
organise the imports on save.

```json
"editor.codeActionsOnSave": {
  "source.organizeImports": true
},
```

That stripped out the `{ h }` I was concerned that it would break but
then found out it worked fine without it.

> `preact-cli` automatically imports `h` for you in any files that
> have JSX, so you can safely remove those imports.

## Local fonts added to the assets folder

The way I got local fonts into the project was by creating a
`fonts.css` file and importing that into the `template.html` file as a
link `<link rel="stylesheet" href="./assets/fonts/fonts.css" />`

```css
@font-face {
  font-family: 'My Local Font';
  src: url('./MyLocalFont.ttf') format('truetype');
}
```

As I only have the `.ttf` font file that is all that I have imported.

If you're using multiple font files then take a look at the [CSS
Tricks post] on it.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title><% preact.title %></title>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1"
    />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="stylesheet" href="./assets/fonts/fonts.css" />
    <% preact.headEnd %>
  </head>
  <body>
    <% preact.bodyEnd %>
  </body>
</html>
```

This can also do this with Google fonts, something like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title><% preact.title %></title>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1"
    />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link
      href="https://fonts.googleapis.com/css2?family=Baloo+Tamma+2:wght@400;700&family=BioRhyme+Expanded:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <% preact.headEnd %>
  </head>
  <body>
    <% preact.bodyEnd %>
  </body>
</html>
```

<!-- Links -->

[css tricks post]:
  https://css-tricks.com/snippets/css/using-font-face/
