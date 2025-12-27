---
date: 2019-03-24
title: Creating a Custom React Hook for Gatsby Site Metadata
tags: ['learning', 'gatsby', 'react', 'hooks', 'guide']
is_private: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Hooks ahoy!

Ok, let's get it on with the new hotness in React-land, React Hooks!
This is a guide covering using the Gatsby custom React hook for
`StaticQuery` which it is now replacing with `useStaticQuery`.

If you haven't used Gatsby before `StaticQuery` is just that, a way to
query data in a Gatsby component (i.e. a react component) or a Gatsby
page where the query input doesn't change. This is a great use case
for data that doesn't change a great deal, like your site metadata.

## tl;dr

Here's me trying to [even] with [codesandbox.io] whilst I convert some
of the Gatsby default starter that's on [codesandbox.io] to use the
`useSiteMetadata` custom hook.

Using [codesandbox.io] we take a look at implementing a custom react
hook for getting site metadata in Gatsby.

**Here's a video:**

<!-- cSpell:ignore Xwbk -->
<YouTube youTubeId="qWay-LjXwbk" />

The `StaticQuery` component uses the [render props] pattern, which
means it takes in a function and returns/renders based off of that.

I have detailed this pattern before in a post about [using the react
context api], it's a component that you pass a function to, to render
a component.

Think of it like this:

```jsx
<Component>
 {() => ()}
</Component>
```

The first parenthesis is the arguments/variables and the second is
what gets rendered, so in the case of the Gatsby `StaticQuery` you
pass a query with a `graphql` tag and then the `data` that comes back
from that is what is used in the render of that component. So you have
your wrapping component that returns and renders a child component,
like this.

```jsx
<WrappingComponent>
  {args => <ComponentToRender propsForComponent={args.propNeeded} />}
</WrappingComponent>
```

Here's a cut down version of the `StaticQuery` component being used in
the Gatsby default starter on [codesandbox.io]

I've taken out the styling to make it a bit shorter:

```js
const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div>
          <main>{children}</main>
          <footer />
        </div>
      </>
    )}
  />
)

export default Layout
```

The `StaticQuery` takes in two props, the `query` and what you want to
render with `render`, this is where you can destructure the data you
need out of the `data` prop returned from the query.

I was never really a fan of doing it that way so I adopted a similar
pattern but with the component contained on it's own and then added to
the `StaticQuery` separately. Like this:

```js
const Layout = ({ children, data }) => (
  <>
    <Header siteTitle={data.site.siteMetadata.title} />
    <div>
      <main>{children}</main>
      <footer />
    </div>
  </>
)

export default props => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => <Layout data={data} {...props} />}
  />
)
```

I found this more acceptable because you didn't have to have all the
code bunched into the `StaticQuery` component.

**That all make sense?**

Good, now forget about all of that! It's time to use the new
`useStaticQuery` hotness in Gatsby. 💪

## Versions:

**This guide is being used with the following dependency versions.**

- gatsby: 2.1.31
- react: 16.8.4
- react-dom: 16.8.4

You can also check out the [example code].

---

The [Gatsby documentation] covers the use of it and also how to make
your own custom react hook to use `useStaticQuery`, here's the one I
use in the video.

_useSiteMetadata.js_

```js
import { graphql, useStaticQuery } from 'gatsby'

const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SITE_METADATA_QUERY {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )
  return site.siteMetadata
}

export default useSiteMetadata
```

This can now be implemented in the rest of the code as a function
call:

```js
const { title, description, author } = useSiteMetadata()
```

## Let's implement it!

In the `layout` component import the `useSiteMetadata` hook then we
can go about removing the `StaticQuery` component and destructuring
`title` from the `useSiteMetadata` hook.

It should look something like this, I have taken the styling out for
brevity:

```js
import React from 'react'
import PropTypes from 'prop-types'
import useSiteMetadata from './useSiteMetadata'

import Header from './header'
import './layout.css'

const Layout = ({ children }) => {
  const { title } = useSiteMetadata()
  return (
    <>
      <Header siteTitle={title} />
      <div>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </>
  )
}
Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
```

Here's the comparison:

<!-- cSpell:ignore compareLayout -->

![compareLayout]

On now to the `seo` component, same again, remove `StaticQuery` and
use `useSiteMetadata` in it's place.

Here's the comparison:

<!-- cSpell:ignore compareSEO -->

![compareSEO]

If you want to check out the code the example is available here:
[example code]

## Wrap up!

That's it! Wh have gone from using the awesome `StaticQuery` render
props pattern used in Gatsby over to the even more awesome
`useStaticQuery` React hooks, hook.

**Thanks for reading** 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

<!-- Links -->

[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[codesandbox.io]: https://codesandbox.io
[render props]: https://reactjs.org/docs/render-props.html
[using the react context api]:  https://scottspence.com/posts/react-context-api
[example code]: https://codesandbox.io/s/1vnvko0zqj
[even]: https://youtu.be/8ruJBKFrRCk?t=93
[gatsby documentation]:  https://www.gatsbyjs.com/docs/use-static-query/

<!-- Images -->

[comparelayout]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858540/scottspence.com/compareLayout-ea4dd0fb5890ca0f00a8d98e9f57a0df.png
[compareseo]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858541/scottspence.com/compareSEO-0e2968ec8991f7a0c3f41e1b64986288.png
