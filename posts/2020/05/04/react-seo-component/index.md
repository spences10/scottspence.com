---
date: 2020-05-04
title: Why Make a React SEO Component
tags: ['learning', 'react', 'seo']
isPrivate: false
---

<script>
  import Vimeo from '$lib/components/vimeo.svelte'
</script>

Here's some of the reasoning and detail that went into making the
[React SEO Component].

There wasn't a **great** deal I knew about Search Engine Optimization
before I set about writing the [Build a coding blog from scratch with
Gatsby and MDX] guide that I published last year.

I'd say I know a _bit_ more now but I still feel it's a bit of a black
art.

One of the main reasons I made the component to get around having to
document the process of making an SEO component that needed to go into
the Build a Blog guide. It was when I was getting toward the end of
writing the guide when I realised that the SEO part of the site was
quite involved.

To begin with I started looking around to see if anyone had created an
SEO component for Gatsby and found a closed [GitHub PR on seo] from
Dustin Schau with some [great notes from Andrew Welch] on SEO and a
link to a presentation he did back in 2017, great stuff.

<Vimeo vimeoId="246846978" />

## Gatsby SEO

Adding an SEO component to a Gatsby site is [well documented] and I,
like a lot of other people developing in Gatsby took [Jason
Lengstorf]'s' lead with the example used on [Marisa's site]. I'd used
this several times already so was familiar with how it worked. The
example that captured my imagination however was from [LekoArts] in
his [Gatsby Starter Prismic] example.

## Open Graph

We all want to have the cool preview cards you see when someone shares
a post on Twitter or LinkedIn. This is done with Facebook's [Open
Graph Protocol] where you add in metadata tags that are picked up by
Twitter, LinkedIn, etc. to display the image added in the tags.

I did some work on an internal project where I work which uses this to
display the `og:image` URL from pages. I was familiar with OGP but not
entirely familiar with the whole adding metadata to the `<head>` of a
site.

## The component

Each time I wanted to add the SEO metadata to a site I had to go find
a project that I had added it to in the past and jack the code from
there and use it in the new project.

There was a lot of wiring things up involved, even when it's a lift
and drop there's usually something slightly different in the props
being passed to the metadata tags.

If you take a look at LeKoArts' example there are three files for
Facebook, Twitter and the SEO.

## Facebook

Facebook has it's set of `<meta>` tags that need to have data passed
to them:

```jsx
<Helmet>
  <meta property="og:locale" content={locale} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={desc} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={desc} />
</Helmet>
```

## Twitter

Twitter has it's tags too:

```jsx
<Helmet>
  {username && <meta name="twitter:creator" content={username} />}
  <meta name="twitter:card" content={type} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={desc} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={desc} />
</Helmet>
```

## SEO has it's things as well

Then there's keeping Google sweet as well with [structured data] this
is so Google can understand the contents of the page. I took LekoArts'
lead on this as it was something I wasn't familiar with at all.
LekoArts did a great job of putting all this together:

```jsx
<>
  <Helmet title={seo.title} titleTemplate={`%s | ${titleTemplate}`}>
    <html lang={siteLanguage ? siteLanguage : 'en'} />
    <link rel="canonical" href={pathname} />
    <meta name="description" content={seo.description} />

    {!article && (
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgWebPage)}
      </script>
    )}
    {article && (
      <script type="application/ld+json">
        {JSON.stringify(schemaArticle)}
      </script>
    )}
    <script type="application/ld+json">
      {JSON.stringify(breadcrumb)}
    </script>
  </Helmet>
  <Facebook
    desc={seo.description}
    image={image}
    title={seo.title}
    type={article ? 'article' : 'website'}
    url={pathname}
    locale={siteLocale ? siteLocale : 'en_gb'}
  />
  <Twitter
    title={seo.title}
    image={image}
    desc={seo.description}
    username={twitterUsername}
  />
</>
```

There's a lot more to this but for the sake of brevity I'm adding what
the component returns. This is largely unchanged in the the component
I made but for a few variables added.

## Make it a thing

I wanted to be able to `yarn add` this rather than have to go pick out
the components from another project each time.

It was interesting trying to find how to do it, I didn't find a great
deal of documentation out there.

I found [this post] with some [example code] on GitHub.

The initial release [used Rollup] with Babel preset for React which
worked fine. I've since moved it to use TypeScript with the awesome
TSDX for [TypeScript package development].

## Enjoy

There's still a lot to do with the component, currently I'm
overwriting some of the tags in this project after writing a
serverless function to generate [Open Graph Images with Gatsby and
Now] which uses these tags:

```jsx
<meta property="og:image" content={ogImageUrl} />
<meta name="twitter:image:src" content={ogImageUrl} />
```

The defaults are empty strings or a default `J Doe` so not great but
there is a lot to go in there and hopefully a lot more to learn from
it by me.

<!-- Links -->

[react seo component]:
  https://www.npmjs.com/package/react-seo-component
[build a coding blog from scratch with gatsby and mdx]:
  https://scottspence.com/2019/10/31/build-an-mdx-blog
[github pr on seo]: https://github.com/gatsbyjs/gatsby/pull/10780
[issue]: https://github.com/gatsbyjs/gatsby/issues/14125
[great notes from andrew welch]:
  https://github.com/gatsbyjs/gatsby/pull/10780#issuecomment-451048608
[lekoarts]: https://github.com/LekoArts
[his own implementation]:
  https://github.com/LekoArts/gatsby-starter-prismic/blob/master/src/components/SEO/SEO.jsx
[jason lengstorf]: https://twitter.com/jlengstorf
[marisa's site]:
  https://github.com/marisamorby/marisamorby.com/blob/master/packages/gatsby-theme-blog-sanity/src/components/seo.js
[well documented]: https://www.gatsbyjs.org/docs/add-seo-component/
[gatsby starter prismic]:
  https://github.com/LeKoArts/gatsby-starter-prismic/blob/master/src/components/SEO/SEO.jsx
[open graph protocol]: https://ogp.me/
[structured data]:
  https://developers.google.com/search/docs/guides/intro-structured-data
[used rollup]:
  https://github.com/spences10/react-seo-component/blob/32acf12d53/rollup.config.js
[typescript package development]: https://github.com/jaredpalmer/tsdx
[open graph images with gatsby and now]:
  https://scottspence.com/2020/04/30/serverless-og-images/
[this post]:
  https://medium.com/recraftrelic/building-a-react-component-as-a-npm-module-18308d4ccde9
[example code]:
  https://github.com/recraftrelic/dummy-react-npm-module/blob/master/package.json
