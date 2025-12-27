---
date: 2020-05-11
title: Styled Components Resources
tags: ['css', 'resource', 'styled-components']
is_private: false
---

A curated list of hints and tips for using styled-components.

## Breakpoints

The first way I found how to do `@media` queries in styled-components
was documented on a Gist.

This is a lift and drop from an old project:

```js
const sizes = {
  monitor: 1800,
  giant: 1500,
  desktop: 992,
  tablet: 768,
  phone: 376,
}

// iterate through the sizes and create a media template
export const media = Object.keys(sizes).reduce(
  (accumulator, label) => {
    // use em in breakpoints to work properly cross-browser and support users
    // changing their browsers font-size: https://zellwk.com/blog/media-query-units/
    const emSize = sizes[label] / 16
    accumulator[label] = (...args) => css`
      @media (max-width: ${emSize}em) {
        ${css(...args)};
      }
    `
    return accumulator
  },
  {}
)
```

Then to use it in the project:

```js
const PageContainer = styled.div`
  ${media.monitor`
    background: goldenrod;
  `};
  ${media.giant`
    background: goldenrod;
  `};
  ${media.desktop`
    background: dodgerblue;
  `};
  ${media.tablet`
    background: mediumseagreen;
  `};
  ${media.phone`
    background: palevioletred;
  `};
`
```
