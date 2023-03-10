---
date: 2020-06-18
title: Theming With Linaria
tags: ['css', 'css-in-js', 'linaria']
isPrivate: false
---

This is a follow up on the post I did about [Getting Started with
Linaria]

The starter I worked on last time I made into a template so it can be
used as the base of this project.

I'll use the Gatsby CLI to spin up a new project:

```bash
gatsby new gatsby-linaria-starter-with-theme https://github.com/spences10/gatsby-starter-linaria
```

## Defaults

In this example I'm using the [defaults from Tailwind CSS] for the
theme.

With this as a base I can then add my own theme on top of that. An
example of why I would want to do that would be with the Tailwind
default there's no `primary` colour.

If I want to add my own primary colour to the theme I can spread the
defaults into my `theme` object, first up though, default theme.

To do that I'm going to create a `theme-defaults.js` file in the
`theme` directory, then create a `project-theme.js` file where I'll
add in the theme properties I want in there.

```bash
# create the files
touch src/theme/{theme-defaults.js,project-theme.js}
```

Paste the Tailwind defaults into the `theme-defaults.js` file, I
prefer to have a named export on files so I'm going to change the
`module.exports = {` to `export const defaults = {`.

```js {1}
export const defaults = {
  prefix: '',
  important: false,
  separator: ':',
  theme: {
    screens: {
  ...
```

The `...` represents the reset of the items in the object, I've
shortened it for brevity otherwise this would be a 400 line snippet.
😅

Really all I need from this is the `theme` object but rather than mess
around with the object I'll destructure the theme out of it in the
`project-theme.js` file.

I can now use the Tailwind defaults in the `project-theme.js` file,
this is also where I can add additional theme options, more on that
shortly, for now I'm going to import the defaults, destructure the
theme out of `defaults` and label it as `themeDefaults` I can then
spread them into my theme object.

```js
import { defaults } from './theme-defaults'

const { theme: themeDefaults } = defaults

export const theme = {
  ...themeDefaults,
}
```

## Theming with Linaria

<!-- cSpell:ignore Callstack -->

If I wanted to I could create my own theme with Linaria [using CSS
custom properties] (variables) but instead I'm going to be using the
[Callstack theme provider] which has a hook I can use in `useTheme`.

```bash
# install the theme provider
yarn add @callstack/react-theme-provider
```

I'm going to create another file in the theme folder imaginatively
named `theme-provider.js` in there I'll import and pass in the theme
object I created:

```js
import { createTheming } from '@callstack/react-theme-provider'
import { theme } from './theme'

export const { useTheme } = createTheming(theme)
```

Now I'll be able to use the `useTheme` hook in my Linaria components
using the `styled` tag.

## Example

In the `Header` component I can now change the background property to
use the theme.

I'll need to import the `useTheme` hook and pass the theme object to
the Linaria `styled` component `theme` prop.

```jsx {2,4}
const Header = ({ siteTitle }) => {
  const theme = useTheme()
  return (
    <StyledHeader theme={theme}>
      <div>
        <h1>
          <Link to="/">{siteTitle}</Link>
        </h1>
      </div>
    </StyledHeader>
  )
}
```

Now in the Linaria `styled` component I can use any of the theme
values. In the Header component I'll change the `background` to blue:

```js {2}
const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.blue[500]};
  margin-bottom: 1.45rem;
  div {
    margin: 0 auto;
    max-width: 960px;
    padding: 1.45rem 1.0875rem;
    h1 {
      margin: 0;
      a {
        color: white;
        text-decoration: none;
      }
    }
  }
`
```

Also a valid way to get the theme values would be:

```js
background: ${props => props.theme.colors.blue[500]};
```

I prefer to destructure the theme out of the props (`({ theme })`)
however.

## Moar theme options

So I have some nice defaults I can call on from the default config
file I jacked from the Tailwind defaults. But what about that primary
colour option?

Taking a look at the defaults there's no option for rebeccapurple (hex
#663399) so I'm going to add one.

In the `project-theme.js` I'll define a new object for the primary
colours, tip if you want to get shades of a particular colour take a
look at [0to255.com].

With my shades of rebeccapurple I can add that to the `theme` object.

```js {7-20}
import { defaults } from './theme-defaults'

const { theme: themeDefaults } = defaults

export const theme = {
  ...themeDefaults,
  colors: {
    primary: {
      100: '#aa7fd4',
      200: '#9966cc',
      300: '#884cc3',
      400: '#773bb2',
      500: '#663399',
      600: '#552b80',
      700: '#442266',
      800: '#331a4d',
      900: '#221133',
    },
    ...themeDefaults.colors,
  },
}
```

Take note that I'm spreading the colours back in after defining the
new colour property. If I don't do this then the object will be
overwritten with the values provided here instead of both.

The new colour can now be used in the same way as before and I swap
out the `blue` colour for the `primary` one.

## Wrap up

So that's how I add theming with Linaria, there was also the
`ThemeProvider` and `withTheme` options that could be used from the
`react-theme-provider` although I did find this way more suited to my
needs.

<!-- Links -->

[getting started with linaria]:
  https://scottspence.com/posts/linaria-getting-started/
[defaults from tailwind css]:
  https://github.com/tailwindcss/designing-with-tailwindcss/blob/master/01-getting-up-and-running/07-customizing-your-design-system/tailwind-full.config.js
[callstack theme provider]:
  https://github.com/callstack/react-theme-provider
[using css custom properties]:
  https://github.com/callstack/linaria/blob/master/docs/THEMING.md#css-custom-properties
[0to255.com]: https://0to255.com
