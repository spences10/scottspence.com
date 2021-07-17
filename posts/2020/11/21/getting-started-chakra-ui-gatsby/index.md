---
date: 2020-11-21
title: Chakra UI and Gatsby - Getting Started
tags: ['gatsby', 'getting started', 'guide']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Ok, so this is another one of those "let's use a new CSS-in-JS library
on a Gatsby default starter project" post.

In this case it's Chakra UI, it's recently gone v1 and I'm keen to use
it.

What I'm going to be doing is styling the [Gatsby starter default]
using Chakra UI and chucking in a theme toggle as well.

This will involve swapping out the styles that come with the [Gatsby
starter default] with Chakra UI ones.

The end result I'm aiming for is for it to look the same as before but
using Chakra UI in place of the styling it comes with.

You can follow along too, or you can **[TL;DR]** for the video.

## Pre requisites

The usual notes on development environment, this comes with the
presumption you'll already have a development environment set up and
configured. If you don't have a development environment then you can
always use [CodeSandbox.io] to get up and running with an environment.

In the examples here I'm using Node version `14.13.0`.

Here's some of the dependencies being used in this guide, they're all
latest versions at the time of writing this.

```json
"@chakra-ui/gatsby-plugin": "^1.0.0",
"@chakra-ui/icons": "^1.0.1",
"@chakra-ui/react": "^1.0.1",
"@emotion/react": "^11.1.1",
"@emotion/styled": "^11.0.0",
"framer-motion": "^2.9.4",
"gatsby": "^2.26.1",
"react": "^17.0.1",
"react-dom": "^17.0.1",
```

## Create the thing

Spin up a new Gatsby project with `npx`:

```bash
npx gatsby new gatsby-chakra-ui
```

You can install and use the Gatsby CLI if you like, in this instance
I'm going `npx` as I'm not going to need any of the Gatsby CLI
functionality.

Wait for that to finish doing it's thing then change directory to the
freshly created gatsby project. Cool, cool, do a quick `yarn develop`
to make sure everything's installed ok with no issues.

## Install the things

Now to install the dependencies needed, there's a few, the `\` here is
so that I can display the items that need installing in a nice format:

```bash
yarn add \
  @chakra-ui/react \
  @emotion/react \
  @emotion/styled \
  framer-motion \
  @chakra-ui/gatsby-plugin \
  @chakra-ui/icons
```

**NOTE** Don't forget to add the Chakra UI Gatsby plugin to the Gatsby
plugin array, I routinely do this! This note is for me just as much as
you dear reader. 😊

I'll add the plugin to the `gatsby-config.js`, at the time of writing
this plugin name was what's recommended in the [Chakra UI
documentation] and shouldn't be confused with the [Gatsby
documentation].

```js
plugins: [
  `@chakra-ui/gatsby-plugin`,
  // many more plugins 👇
```

Stop (`Ctrl+c`) and restart the dev server you'll notice all the
styles are gone, that's the Chakra UI Gatsby plugin doing it's thing.

Now that I have all the power of Chakra UI available to me now I'll
remove the `import "./layout.css"` from the `layout.js` component. I
can also delete the `layout.css` file as it's not needed.

## Root Wrapper time!

So that I can access the Chakra UI Theme provider throughout the
project I'm going to add the `<ChakraProvider>` as [high up in the
React component tree] as possible.

I can do this by using the Gatsby [`wrapPageElement`] API in both the
`gatsby-browser.ja` and the `gatsby-ssr.js` files.

So I'm not to repeating the same code in both of those files I'm going
to create another file, add that in there and import that file into
both the `gatsby-browser.ja` and the `gatsby-ssr.js` files.

The name and location of this file is unimportant, keep it at the root
of the project with the `gatsby-browser.ja` and the `gatsby-ssr.js`
files or add it to the `src` folder, doesn't matter AFAIK.

Create the file, from my terminal I'll do a touch:

```bash
touch src/woot-wapper.tsx
```

Yes, I'm using a TypeScript (`.tsx`) file in a predominantly
JavaScript project, you do you, make it a `.js` file if you like. I'm
trying to get more used to using TS in my projects and Gatsby gives TS
support [out of the box] now.

In the root wrapper file I'll add the Chakra provider and the `Layout`
component.

```tsx
import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import Layout from './components/layout'

export const wrapPageElement = ({ element }) => {
  return (
    <ChakraProvider resetCSS>
      <Layout>{element}</Layout>
    </ChakraProvider>
  )
}
```

So now there's no need to import the layout component into each page
that is created. I'll need to remove the layout from component from
the `404.js`, `index.js` ,`page-2.js` and `using-typescript.tsx`
pages.

Finally I'll need to import the root wrapper into both the
`gatsby-ssr.js` and the `gatsby-browser.js` files.

```js
import { wrapPageElement as wrap } from './src/woot-wapper'

export const wrapPageElement = wrap
```

## Theme Toggle

Using the Chakra UI theme provider means that I can use one of the
provided hooks to toggle the theme.

I'm going to create a theme toggle component:

```bash
touch src/components/toggle-theme.tsx
```

And add in some code to toggle the theme:

```tsx
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  IconButton,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'

export default function ThemeToggle() {
  const { toggleColorMode: toggleMode } = useColorMode()
  const ToggleIcon = useColorModeValue(SunIcon, MoonIcon)

  return (
    <IconButton
      icon={<ToggleIcon />}
      variant="ghost"
      aria-label="Toggle Theme"
      onClick={toggleMode}
    />
  )
}
```

I'll add this to the header component for now.

## Style it with Chakra UI

Ok, now I've done the groundwork I can start removing the inline
styles in this project, I'll start with the header component.

I'll straight up copy pasta the changed code in here, som of these may
be a bit long, I'll shorten them where I can so there's no code walls.

## Style the header

Here's the component with the inline styles swapped out for Chakra UI
styles.

I've left out the default export and prop types for brevity.

```js
import { Box, Heading, Link } from '@chakra-ui/react'
import { Link as GatsbyLink } from 'gatsby'
import React from 'react'
import ThemeToggle from './theme-toggle'

const Header = ({ siteTitle }) => (
  <Box as="header" background="rebeccapurple" marginBottom="1.45rem">
    <Box as="div" m="0 auto" maxW="960px" p="1.45rem 1.0875rem">
      <Heading margin="0">
        <Link
          as={GatsbyLink}
          to="/"
          color="white"
          _hover={{ textDecor: 'none' }}
        >
          {siteTitle}
        </Link>
      </Heading>
    </Box>
    <Box as="div" position="fixed" right="20px" top="20px">
      <ThemeToggle />
    </Box>
  </Box>
)
```

Notice that the `<header>` tag and the `<div>` tags are now both
Chakra UI `<Box>` components?

They're both using the Chakra UI [`as`] prop, this is a feature that
allows you to pass an HTML tag or component to be rendered. Pretty
neat right?

You'll also notice that the Chakra UI `Link` component is being
rendered `as` a Gatsby `Link` component, I also removed the underline
on hover with the `_hover` prop.

So with that being done it takes the 42 lines that was there
previously down to 35 lines of code.

I've also added the theme toggle button, not the best way to position
it mind you, just for funsies!

## Style the layout

Onto the layout component now, same thing here with the `<div>`,
`<main>` and `<footer>` tags here.

I'm going to forgo showing the imports export and prop types here
again and I'll add in what's changes in the render of the component.

```jsx
return (
  <>
    <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
    <Box as="div" m="0 auto" maxWidth="960px" p="0 1.0875rem 1.45rem">
      <Box as="main">{children}</Box>
      <Box as="footer" marginTop="2rem" fontSize="xl">
        © {new Date().getFullYear()}, Built with
        {` `}
        <Link
          isExternal
          textDecor="underline"
          color="purple.500"
          href="https://www.gatsbyjs.com"
        >
          Gatsby
        </Link>
      </Box>
    </Box>
  </>
)
```

You may notice the addition of the [`fontSize`] prop added to the
footer, I'll be using this a bit more when editing the pages.

There's also additional props for the link component, I added the
`isExternal` prop to indicate that the link is pointing to an external
link, `textDecor` to add the link underline and `color` to it.

Ok, that's it for the components, onto the pages now.

## Style the 404 page

On the 404 page, I've added in a Chakra UI `<Heading>` and `Text`
components and added the `fontSize` prop along with with some margin
top and bottom on the text component with the `my` prop.

```jsx
import { Heading, Text } from '@chakra-ui/react'
import React from 'react'
import SEO from '../components/seo'

const NotFoundPage = () => (
  <>
    <SEO title="404: Not found" />
    <Heading>404: Not Found</Heading>
    <Text fontSize="xl" my={5}>
      You just hit a route that doesn&#39;t exist... the sadness.
    </Text>
  </>
)

export default NotFoundPage
```

## Style the Index page

The index page you'll notice is a bit larger due to the additional
props needed for the link components.

```jsx
const IndexPage = () => (
  <>
    <SEO title="Home" />
    <Heading>Hi people</Heading>
    <Text fontSize="xl" my={5}>
      Welcome to your new Gatsby site.
    </Text>
    <Text fontSize="xl" my={5}>
      Now go build something great.
    </Text>
    <Box as="div" maxWidth="300px" marginBottom="1.45rem">
      <Image />
    </Box>
    <Link
      as={GatsbyLink}
      textDecor="underline"
      color="purple.500"
      fontSize="xl"
      to="/page-2/"
    >
      Go to page 2
    </Link>
    <br />
    <Link
      as={GatsbyLink}
      textDecor="underline"
      color="purple.500"
      fontSize="xl"
      to="/using-typescript/"
    >
      Go to "Using TypeScript"
    </Link>
  </>
)
```

Additional props for the link components includes the text, underline
and colour props I've already used.

## Style the Page 2 page

Same as with the index page for styling the Gatsby links with Chakra
UI here.

```jsx
const SecondPage = () => (
  <>
    <SEO title="Page two" />
    <Heading>Hi from the second page</Heading>
    <Text fontSize="xl" my={5}>
      Welcome to page 2
    </Text>
    <Link
      as={GatsbyLink}
      to="/"
      color="purple.500"
      fontSize="xl"
      textDecor="underline"
    >
      Go back to the homepage
    </Link>
  </>
)
```

## Style the Using TypeScript page

Same again with the TypeScript file here, I've added in the `as` prop
to refer to the link as a Gatsby link along with the `textDecor`,
`color` and `fontSize` props.

I've removed the text from this example to reduce the overall size of
the code block.

```tsx
const UsingTypescript: React.FC<PageProps<DataProps>> = ({
  data,
  path,
}) => (
  <>
    <SEO title="Using TypeScript" />
    <Heading>Gatsby supports TypeScript by default!</Heading>
    <Text fontSize="xl" my={6}>
      This means that you can create and write <em>.ts/.tsx</em> files
      ...
    </Text>
    <Link
      isExternal
      textDecor="underline"
      color="purple.500"
      href="https://www.gatsbyjs.com/docs/typescript/"
    >
      documentation about TypeScript
    </Link>
    <Link
      as={GatsbyLink}
      textDecor="underline"
      color="purple.500"
      fontSize="xl"
      to="/"
    >
      Go back to the homepage
    </Link>
  </>
)
```

## Here's a video detailing the process

<YouTube youTubeId="hXM9Ju_NIpU" />

## Recap and wrap up!

That's it for this one! To recap what I did:

- Create a Gatsby starter using npx
- Add Chakra UI packages
- Created a theme toggle using the Chakra UI `useColorMode` hook
- Swap out inline styles with Chakra UI components

If you want to use the code here [I made a starter] you can use with
the Gatsby CLI or straight up clone and install the dependencies.

Done!

I'm only beginning to get familiar with Chakra UI so I'll be writing
more about it as I continue to use it.

## Thanks for reading 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

## Resources

These are literally all linking to the Chakra UI documentation:

- [Chakra UI typography heading]
- [Chakra UI components/link]
- [Chakra UI typography/text]
- [Chakra UI The `as` prop]
- [Chakra UI style-props]
- [Chakra UI theming theme]
- [Chakra UI theming colors]

<!-- Links -->

[gatsby starter default]:
  https://github.com/gatsbyjs/gatsby-starter-default
[gatsby documentation]:
  https://www.gatsbyjs.com/plugins/gatsby-plugin-chakra-ui/
[chakra ui getting started]:
  https://chakra-ui.com/docs/getting-started
[codesandbox.io]: http://codesandbox.io/
[high up in the react component tree]:
  https://scottspence.com/2020/02/06/globally-style-gatsby-styled-components/#place-globalstyle-at-the-top-of-the-react-tree-
[chakra ui documentation]:
  https://github.com/chakra-ui/chakra-ui/blob/develop/website/pages/guides/integrations/with-gatsby.mdx#gatsby-plugin
[`wrappageelement`]:
  https://www.gatsbyjs.com/docs/browser-apis/#wrapPageElement
[out of the box]: https://www.gatsbyjs.com/docs/typescript/
[`as`]: https://chakra-ui.com/docs/features/style-props#the-as-prop
[`fontsize`]:
  https://chakra-ui.com/docs/typography/text#changing-the-font-size
[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[chakra ui typography heading]:
  https://chakra-ui.com/docs/typography/heading
[chakra ui components/link]:
  https://chakra-ui.com/docs/components/link
[chakra ui typography/text]:
  https://chakra-ui.com/docs/typography/text
[chakra ui the `as` prop]:
  https://chakra-ui.com/docs/features/style-props#the-as-prop
[chakra ui style-props]:
  https://chakra-ui.com/docs/features/style-props
[chakra ui theming theme]: https://chakra-ui.com/docs/theming/theme
[chakra ui theming colors]:
  https://chakra-ui.com/docs/theming/theme#colors
[tl;dr]: #heres-a-video-detailing-the-process
[i made a starter]:
  https://github.com/spences10/gatsby-starter-chakra-ui
