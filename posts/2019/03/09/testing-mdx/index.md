---
date: 2019-03-09
title: Testing MDX
tags: ['learning', 'gatsby', 'mdx']
isPrivate: false
---

Moving to the new hotness!!

I've now moved this blog over to Gatsby MDX. You can see all the
changes
[on my repo here](https://github.com/spences10/blog.scottspence.me/pull/1128/files).

<!-- cSpell:ignore leko -->

From the pull I'm hoping you can glean that the majority of the work
is in replacing `gatsby-transformer-remark` with `gatsby-mdx`, there
are some additional files added, that pretty nifty `Code.js` component
from LekoArts minimal starter blog, and the `wrap-root-element.js`
module for (I think) the MDX rendering of the code.

Files changed:

- `gatsby-browser.js`
- `gatsby-config.js`
- `gatsby-node.js`
- `gatsby-ssr.js`
- `src/pages/index.js`
- `src/templates/blogPostTemplate.js`

Files added:

- `src/components/Code.js`
- `wrap-root-element.js`

Shout out to LekoArts, HagNerd and Chris Biscardi for their example
repositories:

- [gatsby-starter-minimal-blog](https://github.com/LekoArts/gatsby-starter-minimal-blog)
- [gatsby-starter-blog-mdx](https://github.com/hagnerd/gatsby-starter-blog-mdx)
- [christopherbiscardi.github.com](https://github.com/ChristopherBiscardi/christopherbiscardi.github.com)

## Things I still haven't figured out

### Code blocks

Code blocks are pretty, this is a `js` block with the
`prism-react-renderer/themes/nightOwl` theme:

```js
const onClick = () => {
  alert('clicked')
}
render(<button onClick={onClick}>Click Me!</button>)
```

And here is a `js react-live` block, try editing the code:

```js react-live
const onClick = () => {
  alert('clicked')
}
render(<button onClick={onClick}>Click Me!</button>)
```

Image for prosperity 👍

<!-- cSpell:ignore highlightVLive -->

![highlightVLive]

### Mdx is a bit slow

### Sometimes renders don't update

### Not working yet

- [ ] Autolink headers
- [ ] Embed tweets
- [ ] Embed videos

<!-- Images -->

[highlightvlive]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858538/scottspence.com/highlightVLive-3b1ee37a5c2b58e0079a1c23bea2b7e4.png
