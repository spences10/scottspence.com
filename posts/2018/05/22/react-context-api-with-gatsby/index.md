---
date: 2018-05-22
title: Use the React Context API with Gatsby
tags: ['learning', 'guide', 'gatsby', 'api']
excerpt: ''
isPrivate: false
---

I'm a bit late to the party using the new [React Context API], I did
get to use it the other day at work, I also [made a snippet] to
scaffold out a component for it.

I had followed a couple of guides explaining how to use it and neither
of them as good as this great explanation of [how to use it] from
[@leighchalliday], thank you Leigh 🙏 It's a great use case which
helped me understand how to use it.

So, after doing this in a CRA project I decided to use it on one of my
Gatsby projects. With Gatsby the layout is slightly different where
you can have multiple layouts for differing sections of your app, so
this lends well for passing context.

One thing to bear in mind is that this is for my specific use case so
I'll apologise upfront now if any of this is confusing, I'm trying to
get this documented to help me understand it too 👍

With Gatsby if you want to use the React 16.3 then you will need to
install the Gatsby React next plugin:

```js
npm install gatsby-plugin-react-next
```

Gatsby uses React 16.2 I believe so you will need to use this plugin.

Another thing you may need to do is:

```bash
npm i react react-dom
npm un react react-dom
```

This may be because I was trying to use it in an old project, I've had
to do this on three projects now as I was getting `createContext` is
not a function errors until I did this.

One other thing you may want to consider if it appears nothing is
working try using the `npm ci` command. This is the npm 6+ version of
deleting your `node_modules` folder and reinstalling. 🤓

So let's go through one of my favourite use cases at the moment and
add theming support to a Gatsby site and use the React context API to
manage the theme.

You can see how theme a React app without the React Context API in my
[styled-components 💅 getting started] post.

For illustration I'll go over it here now, you add the `ThemeProvider`
at the highest level in the application structure so that all
descendants/children of the app can access it.

I have already done this for my [personal site] and now I'm going to
do it [here] so let's go through it together.

## Let's make a component!

Ok, so everything in React is a component, that's why I like it so
much - so let's make a `SomethingContext.js` component, as I want to
do the things with the styled-components 💅

Let's start by giving it an imaginative name:

```js
touch src/layouts/components/BlogThemeContext.js
```

There we go 👍

Ok, the 'things' I want to do with the Context API are:

1.  change the styled-components `ThemeProvider`
2.  rotate the site hero patterns

Now to scaffold out the context component, I have already mentioned
the [VS Code snippet] for my own personal use which is the basic
structure for the `Context` which is in two parts, a `Provider` and a
`Consumer`

Let's create the `Context` and the `Consumer` in this component.

**Using the snippet it should look something like this:**

`src/layouts/components/BlogThemeContext.js`

```js
import React from 'react'
// Context is made up of two things
// Provider - Single as close to top level as possible
// Consumer - Multiple have multiple consumers
export const BlogThemeContext = React.createContext()

export class BlogThemeProvider extends React.Component {
  state = {
    item1: 1,
    item2: 2,
  }

  // add function here
  functionHere = () => {
    this.setState({
      item1: 2,
      item2: 3,
    })
  }
  render() {
    return (
      <BlogThemeContext.Provider
        value={{
          ...this.state,
          functionHere: this.functionHere,
        }}
      >
        {this.props.children}
      </BlogThemeContext.Provider>
    )
  }
}
```

So the `props` passed into the `<BlogThemeContext.Provider>` is the
state and the methods contained in `BlogThemeProvider` these can then
be accessed throughout the app by using the
`<BlogThemeContext.Consumer>`.

Now let's add the `BlogThemeProvider` at the top level of our app so
that the state and functions of the provider can are accessible for
the children of the `layout/index.js`.

This is what it looks like before adding the context provider, you'll
notice that the styled-components `ThemeProvider` is a top level
component here.

`src/layouts/index.js`

```js
const TemplateWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <PageContainer>
      <Helmet title={nameContent} meta={siteMeta} />
      <Header />
      <Main>{children()}</Main>
      <Footer />
    </PageContainer>
  </ThemeProvider>
)
```

Now we already have the styled-components `ThemeProvider` which
receives a `theme` object, and we want to manage the theme in our
context provider. So let's import the existing theme from the
`globalStyle` module into `BlogThemeContext` and add `theme` to the
state of the `BlogThemeProvider`:

```js
import React from 'react'
import PropTypes from 'prop-types'

import { theme } from '../../theme/globalStyle'

// Context is made up of two things
// Provider - Single as close to top level as possible
// Consumer - Multiple have multiple consumers
export const BlogThemeContext = React.createContext()

export class BlogThemeProvider extends React.Component {
  state = {
    theme,
  }

  // add function here
  functionHere = () => {
    this.setState({
      item1: 2,
      item2: 3,
    })
  }
  render() {
    return (
      <BlogThemeContext.Provider
        value={{
          ...this.state,
          functionHere: this.functionHere,
        }}
      >
        {this.props.children}
      </BlogThemeContext.Provider>
    )
  }
}

BlogThemeProvider.propTypes = {
  children: PropTypes.any,
}
```

While we're here let's also add the function to handle the theme
changing by replacing the dummy `functionHere` function in the snippet
and also bring in the themes we want to switch between.

```js
import React from 'react'
import PropTypes from 'prop-types'

import { theme1, theme2 } from '../../theme/globalStyle'

export const BlogThemeContext = React.createContext()

export class BlogThemeProvider extends React.Component {
  state = {
    theme,
  }

  handleThemeChange = e => {
    let theme = e.target.value
    theme === 'theme1' ? (theme = theme1) : (theme = theme2)
    this.setState({ theme })
  }
  render() {
    return (
      <BlogThemeContext.Provider
        value={{
          ...this.state,
          handleThemeChange: this.handleThemeChange,
        }}
      >
        {this.props.children}
      </BlogThemeContext.Provider>
    )
  }
}

BlogThemeProvider.propTypes = {
  children: PropTypes.any,
}
```

## Use the `Context.Consumer`

So, now, let's use it, right? The way to use is much like with the
styled-component `ThemeProvider`, import your `<ThemeSelectProvider>`
then you can use the `<ThemeSelectContext.Consumer>` to access the
functions and state of the `BlogThemeContext` via the
`<ThemeSelectProvider>`

The child of a consumer is a function, so rather than have your app
being returned like you would with a normal React component like this:

```js
<Wrapper>
  <Child />
</Wrapper>
```

So you need to embed a function like this:

```js
<Wrapper>{() => <Child />}</Wrapper>
```

So you're returning the (in this example, `<Child />`) app as the
result of the `<Context.Consumer>` function, here we can also get any
of the properties or state from the Context, in my use case here I
want to get the `theme` prop out of the Context provider `value`
(`<BlogThemeProvider>`) so we'll use ES6 destructuring to pull out the
`theme` object.

The styled-components `ThemeProvider` can now use the `theme` object
supplied by the `<BlogThemeContext.Consumer>` so it's safe to remove
the import from `globalStyle`.

```js
const TemplateWrapper = ({ children }) => (
  <BlogThemeProvider>
    <BlogThemeContext.Consumer>
      {({ theme }) => (
        <ThemeProvider theme={theme}>
          <PageContainer>
            <Helmet title={nameContent} meta={siteMeta} />
            <Header />
            <Main>{children()}</Main>
            <Footer />
          </PageContainer>
        </ThemeProvider>
      )}
    </BlogThemeContext.Consumer>
  </BlogThemeProvider>
)
```

There's also a template `src/template/blog-posts.js` which Gatsby uses
to generate the posts in this blog, let's make it the same, let's wrap
the app in the return function for the context consumer, before it
looked like this:

```js
const Template = ({ data, pathContext }) => {
  const { markdownRemark: post } = data
  const { frontmatter, html } = post
  const { title, date } = frontmatter
  const { next, prev } = pathContext

  return (
    <PostWrapper border={({ theme }) => theme.primary.light}>
      <Helmet title={`${title} - blog.scottspence.me`} />
      <Title>{title}</Title>
      <TitleDate>{date}</TitleDate>
      ....
```

Now it looks like this:

```js
const Template = ({ data, pathContext }) => {
  const { markdownRemark: post } = data
  const { frontmatter, html } = post
  const { title, date } = frontmatter
  const { next, prev } = pathContext

  return (
    <BlogThemeProvider>
      <BlogThemeContext.Consumer>
        {({ theme }) => (
          <PostWrapper border={({ theme }) => theme.primary.light}>
            <Helmet title={`${title} - blog.scottspence.me`} />
            <Title>{title}</Title>
            <TitleDate>{date}</TitleDate>
            ....
```

## Add a ThemeSelect component

The `ThemeSelect` component is a select component I have used several
times now, [here's the source] from my personal site, it's what we're
going to use to handle the theme change, it will use the
`handleThemeChange` method in the `BlogThemeContext` so we better use
a Context consumer to access the method:

`src/layouts/components/Footer.js`

```js
<BlogThemeContext.Consumer>
  {({ handleThemeChange }) => (
    <ThemeSelectWrapper>
      <ThemeSelect handleThemeChange={handleThemeChange} />
    </ThemeSelectWrapper>
  )}
</BlogThemeContext.Consumer>
```

Now if we have a look at the `state` in the React dev tools we can see
the font changing with the selection of the theme change, much like in
the [styled-components 💅 getting started] post.

![theme switching]

Ok, success 💯 now onto the background switching/transition thingy.

## Switch hero (background patterns)

So, right now to switch between [Steve Schoger]'s awesome [hero
patterns] I have a function sitting in the `globalStyle` module which
returns a random HERO pattern:

```js
export const randoHero = () => {
  const keys = Object.keys(HERO)
  return HERO[keys[(keys.length * Math.random()) << 0]]
}
```

This function sets the background on the `body` each reload with a
random key from the `HERO` object, now I'm going to move that to the
`componentDidMount()` of `BlogThemeContext.Provider` so (for now) it
selects a random key from the object every ten seconds:

```js
export class BlogThemeProvider extends React.Component {
  state = {
    theme: theme1,
    background: HERO[0]
  }

  handleThemeChange = e => {
    let theme = e.target.value
    theme === 'theme1' ? (theme = theme1) : (theme = theme2)
    this.setState({ theme })
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const keys = Object.keys(HERO)
      const background =
        HERO[keys[(keys.length * Math.random()) << 0]]

      this.setState({ background })
    }, 10 * 1000)
  }

  render() {
  ....
```

Now to find somewhere in the app that can change the background! As I
mentioned before the background for the page was set on the `body` via
styled-components `injectGlobal` I now want to access the `background`
prop from Context so I have moved this to `src/layouts/index.js`. I
already have the Context consumer added for the `theme` so let's
destructure the `background` prop out as well:

```js
const TemplateWrapper = ({ children }) => (
  <BlogThemeProvider>
    <BlogThemeContext.Consumer>
      {({ theme, background }) => (
        <ThemeProvider theme={theme}>
          <PageContainer background={background}>
            <Helmet title={nameContent} meta={siteMeta} />
            <Header />
            <Main>{children()}</Main>
            <Footer />
          </PageContainer>
          ....
```

Now use the `background` prop in the main wrapper `PageContainer`

We're passing the both the background image and colour as
styled-component props now.

```js
const PageContainer = styled.div`
  background-color: ${props => props.theme.background};
  background-image: url("${props => props.background}");
  background-attachment: fixed;
```

That's it! We have used the React Context API to access state and use
it at (two) different points in the app.

## Thanks for reading 🙏

Thanks you for looking at all the code walls!

If you have any feedback [please get in touch]

You can find all the source code to this on my repo for this project
here: https://scottspence.com/

<!-- Links -->

[react context api]: https://reactjs.org/docs/context.html
[made a snippet]:
  https://github.com/spences10/settings/blob/35ba1ca3e9871c3ea6344ca2274ebbd327a18bed/globalVs.code-snippets#L74-L112
[how to use it]: https://www.youtube.com/watch?v=yzQ_XulhQFw
[@leighchalliday]: https://twitter.com/leighchalliday
[styled-components 💅 getting started]:
  https://scottspence.me/styled-components-getting-started
[personal site]: https://scottspence.me
[here]: https://scottspence.com
[vs code snippet]:
  https://github.com/spences10/settings/blob/71dc76fb8e11c176f4517431be57c021fb72411a/globalVs.code-snippets#L74-L111
[please get in touch]: https://scottspence.me/contact
[here's the source]:
  https://github.com/spences10/scottspence.me/blob/master/src/components/ThemeSelect.js
[steve schoger]: https://twitter.com/steveschoger
[hero patterns]: https://www.heropatterns.com/

<!-- Images -->

[theme switching]:
  https://thepracticaldev.s3.amazonaws.com/i/r1b8qgu6lm5xjjondse7.gif
