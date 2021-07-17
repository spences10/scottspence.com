---
date: 2020-05-02
title: CSS Variables Fallback
tags: ['learning', 'css']
isPrivate: false
---

<script>
  import Tweet from '$lib/components/tweet.svelte'
</script>

I used CSS variables to make a theme switch, light and dark, I've done
this [in the past] using styled-components but not attempted it via
the CSS variables route.

With styled-components you defined your colour schemes or themes in a
`theme` object then use the styled-components `ThemProvider` to switch
between the two high up in the component tree.

This time round I used a React hook to switch the theme and used CSS
variables for a light and dark theme.

I got a bit carried away and used variables for lot's of other things
besides a simple colour, I used it for gradients and a box shadow,
here's the light side:

```css
body[data-theme='light'] {
  --colour-background: #f7fafc;
  --colour-on-background: #1a202c;
  --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px
      rgba(0, 0, 0, 0.05);
  --box-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px
      10px -5px rgba(0, 0, 0, 0.04);
  --title-gradient: linear-gradient(#9966cc, #663399);
  --qrt-turn-gradient: linear-gradient(0.25turn, #9966cc, #663399);
}
```

This is mixed in with a design system approach I've adapted from how
Tailwind is set out.

So that CSS will be in a CSS-in-JS style and in this instance is
living with the global styles of the project. They are defined in a JS
theme object, and exported, like this:

```js
export const GlobalStyle = createGlobalStyle`
  body[data-theme="light"] {
    --colour-background: ${({ theme }) => theme.colours.grey[100]};
    --colour-on-background: ${({ theme }) => theme.colours.grey[900]};
  }
  ...
`
```

I was using the CSS gradient like this, thinking that :

```css
background: var(--title-gradient);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```

I was quite happy and feeling kinda smug with myself that I could
abstract away those gradients and box shadows. Then things started to
get a bit janky on the first render and I couldn't work out what I had
done wrong.

<Tweet tweetLink="spences10/status/1256270671539253250" />

I was getting an awful flash of unstyled content, well I say unstyled
content, it wasn't actually unstyled as the text was transparent which
was part of the styles, it's just the gradient wasn't being applied.

So, go back to how it was originally, ok that worked:

```css
background: linear-gradient(#9966cc, #663399);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```

I found that if I didn't use the variable then it rendered fine, but I
needed to use the variable or no theme!

So I was searching for a fallback solution but couldn't find anything
and it wasn't until I found [this article] that I realised that I was
adding the fallback in the wrong place.

```css
background: linear-gradient(
  var(
    --title-gradient-from,
    $ {({theme}) => theme.colours.primary[200]}
  ),
  var(
    --title-gradient-to,
    $ {({theme}) => theme.colours.primary[500]}
  )
);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```

This drawback here is that I have had to put in the default colour
scheme fallback, which means if the user has the dark theme set then
they're going to have the light theme flash first.

<!-- Links -->

[in the past]: https://scottspence.com/2018/09/08/react-context-api/
[this article]:
  https://medium.com/fbdevclagos/how-to-leverage-styled-components-and-css-variables-to-build-truly-reusable-components-in-react-4bbf50467666
