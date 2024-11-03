---
date: 2020-04-30
title: Open Graph Images with Gatsby and Now
tags: ['guide', 'markdown']
is_private: false
---

<script>
  import { Tweet, YouTube } from 'sveltekit-embed'
  import { Details } from '$lib/components'
</script>

I recently purged all the cover images from this site to reduce the
overall size of the project, plus they don't really add to the
content.

The only real plus for having a cover image was to that I could get
the sweet preview cards you get when sharing on social platforms like
Twitter and LinkedIn.

I followed the awesome video content and [blog post] from Leigh
Halliday to build my own. I now have a way to generate social sharing
cards without having to add a cover image to every post I do.

Check out the [interactive example] to have a play with and understand
how the card in generated.

This isn't going to be a step by step guide on how to do that as Leigh
has done a really good job of that with this videos.

I'll list them out here with my own commentary on my findings.

## Build and deploy

Leigh really suffered with the Now CLI and was constantly restarting
it, now it is a bit more permissive so if you follow along you won't
get as many issues.

You will need to `now` your project before you can run `now dev`
however. It needs to be on the platform before you can use the
`now dev` locally.

It's not essential it's on GitHub at this point as you can add in the
integration later on the Vercel dashboard.

For me, to begin with, I couldn't work out why I kept getting these
error messages:

![no tsc config error]

The reason? I didn't have a `tscconfig.json` file in the project so
the Now platform had no idea what to do with the project!

Here's Leigh getting set up:

<Details buttonText="Expand to watch.">
  <YouTube youTubeId="Al3tCJKOydY" />
</Details>

Cool, cool, after that video I had a card rendering to HTML after
running the `now dev` command.

## Parsing params

Here is where I set up the incoming message variables that will be
used to add title, author, etc to the card.

After this I can now add the variables to the HTML being generated.

I didn't get the issues Leigh was having with the Now CLI having to
restart it continually.

<!-- cSpell:ignore Nedwsf -->

<Details buttonText="Expand to watch.">
  <YouTube youTubeId="ANedwsfXpO0" />
</Details>

## Temporary file

Write the HTML to a temp file, which I could create the file but
couldn't access the file locally via the browser like Leigh does. I
could `cat` the contents however.

<!-- cSpell:ignore Lgju -->

<Details buttonText="Expand to watch.">
  <YouTube youTubeId="KlLgjuUQoJs" />
</Details>

## Taking a screenshot

In this video I set up Chromium so that the HTML that was generated in
the previous video can be rendered in super secret 'headless' mode in
Chromium.

To do this locally you will need to find the path of where Chrome is,
for me, being a Linux user I did:

<!-- cSpell:ignore whereis -->

```bash
whereis google-chrome-stable
google-chrome-stable: /usr/bin/google-chrome-stable
```

And took `/usr/bin/google-chrome-stable` for the `execPath` to be used
by Chromium.

Sing us a song while we wait for the build to finish Leigh! 😂

<Details buttonText="Expand to watch.">
  <YouTube youTubeId="ZjGCiBpDZ7g" />
</Details>

In my project for this I've kept the HTML version so I can edit the
card locally, if you take a look at my project I've left comments in
there for what to comment out.

At the end of the last video there Leigh covers how he's implemented
it in his project.

I watched these videos twice before and a third time whilst I followed
along, Leigh is a great teacher but there is quite a bit to take in
here (for me anyway!).

There wasn't really any issues with me getting this project up and
running, some sticking points were Chromium and not being able to
access the local file in my browser.

## How to even though?

In the beginning, before I started however, I wasn't really clear on
how to use it in a project.

I reached out to Leigh to clarify,

> "do you build it into an existing project you want to use it in?"

Or,

> "Or is it something you `npm` install and use like that?"

<Tweet tweetLink="spences10/status/1255155419107844097" />

Leigh really had to spell it out for me as I was clearly struggling
with the concept of how it worked!

<Tweet tweetLink="leighchalliday/status/1255156120219508737" />

So the function lives off on the Vercel platform and creates an image
with whatever variables you pass to it.

## Interactive example

Here's an interactive example, edit the `params` object here to
generate an image:

```js react-live
const params = {
  author: `Scott Spence`,
  website: `scottspence.com`,
  title: `Serverless OG Image Example Card`,
  image: `https://scottspence.me/favicon.png`,
}

const objectToQueryParams = obj => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return '?' + params.join('&')
}

const Image = () => {
  return (
    <img
      alt={params.title}
      style={{ width: '100%' }}
      src={`https://image-og.now.sh/og.jpg${objectToQueryParams(
        params
      )}`}
    />
  )
}

render(Image)
```

Pretty neat, right? So how to get that into a project. In the case of
this project I used a function to build the URL then passed that into
the head of the page with React Helmet.

I jacked this example from Leigh Halliday's page, in your component
you need to build the URL you want to pass to the serverless function.
I the case of this project I'm pulling the values from the MDX
frontmatter for the title, the rest is either hard coded or pulled
from the site metadata.

```js
const ogImageUrl = buildURL('https://image-og.now.sh/og.jpg', {
  author: authorName,
  website: 'scottspence.com',
  title: title.length > 55 ? `${title.substring(0, 55)}...` : title,
  image: 'https://scottspence.me/favicon.png',
})
```

This is what `buildURL` looks like:

```js
const buildURL = (url, obj) => {
  const query = Object.entries(obj)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&')

  return `${url}?${query}`
}
```

The resulting URL from `ogImageUrl` is used in React Helmet with the
corresponding meta tags for the Open Graph images.

```jsx
<Helmet encodeSpecialCharacters={false}>
  <meta property="og:image" content={ogImageUrl} />
  <meta name="twitter:image:src" content={ogImageUrl} />
</Helmet>
```

## There were issues

There was one particular issue that did, and still does have me
confused, in the previous code example with React Helmet you see the
prop `encodeSpecialCharacters` set to false.

Well, if I built the site and inspected the source I could pick out
the image URL from the page HTML, if you take a look you may be able
to see the issue.

![page source url]

Here's an example URL of what is being added to the page source:

<!-- cSpell:ignore Fscottspence,Ffavicon -->

```text
https://image-og.now.sh/og.jpg
  ?author=Scott%20Spence
  &amp;website=scottspence.com
  &amp;title=Serverless%20OG%20Image%20Example%20Card
  &amp;image=https%3A%2F%2Fscottspence.me%2Ffavicon.png
```

Getting `&amp;` instead of `&` so if you copy paste this link into a
browser you get this sort of image:

![undefined og]

I still get this now if I go inspect the source of a page on the site
and opening one of the URLs give the same error.

But it works if you share the link on Twitter or LinkedIn, so, like I
said, I'm not entirely sure what is going on there.

Check out the videos from Leigh, the source for his project is
available [here], and you can see the implementation of his [OG Image
function] in his site.

Mine are pretty much the same, except for different styling on the
card, here's source for my [Generate OG Image] and also how I'm
implementing it [into this site].

<!-- Links -->

[blog post]: https://www.leighhalliday.com/serverless-og-image
[here]: https://github.com/leighhalliday/og-image
[og image function]:
  https://github.com/abnormalstudio/leighhalliday/blob/master/src/templates/article.tsx#L73
[generate og image]: https://github.com/spences10/generate-og-image
[into this site]:
  https://github.com/spences10/thelocalhost/blob/master/src/templates/post-template.js#L157
[interactive example]: #interactive-example

<!-- Images -->

[no tsc config error]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858542/scottspence.com/no-tsc-config-e9f31650c9c030db545f53eee91277a2.png
[page source url]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858542/scottspence.com/page-source-image-url-d3f732295bfea040414f963976b7287f.png
[undefined og]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858541/scottspence.com/undefined-og-image-63cb64d032a31d5ffa730e5e4d5ed10d.jpg
