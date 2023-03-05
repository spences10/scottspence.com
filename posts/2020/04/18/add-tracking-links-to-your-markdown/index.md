---
date: 2020-04-18
title: Add Analytics Tracking Links to your Markdown
tags: ['analytics', 'learning', 'guide']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

I'm talking Fathom Analytics again, this time about tracking link
clicks in my Markdown.

I have written about how to [track custom events] with Fathom
previously and this is really an extension to that post.

If you would like to try Fathom and get a £10 discount on your first
invoice check [my affiliate link].

This situation is specific to using MDX and the MDXProvider as it
gives the ability to override rendering of links.

## The problem 🤔

I'd like to add a [Fathom goal] to a link in my Markdown, to do this
I'll need to get the goal ID I've created in Fathom to the link so
that when it's clicked it's logged with Fathom.

So I can add an `onClick` event to the `a` tag using the MDXProvider
and pass that ID to the analytics provider.

## The solution 💡

Ok, so I need a way to add a prop to a specific link that contains the
goal ID for Fathom.

Using a made up attribute added to the markup for the goal ID I can
pick out the ID and pass it to the analytics provider from the `A`
component I'm using to override the links in the Markdown.

```js {2,7}
export const A = props => {
  const fa = useAnalytics()
  return (
    <a
      {...props}
      id={props.id}
      onClick={() => fa(props.goal)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  )
}
```

So the Markdown will look something like this:

```md
# My awesome Markdown

<!-- cSpell:ignore IBQBRDPP -->

Fathom Analytics recently added a feature for
<a href="https://usefathom.com/blog/bypass-adblockers" goal="IBQBRDPP">custom
domains</a> with their service.
```

So, job done right?

<!-- cSpell:ignore Wellllll -->

Wellllll....

No.

## The other problem (for me anyway) 😧

I spend a lot of my time in Markdown files and I rarely use inline
links. With an inline Markdown link the link from that last example it
would look something like this:

```md
# My awesome Markdown

Fathom Analytics recently added a feature for
[custom domains](https://usefathom.com/blog/bypass-adblockers) with
their service.
```

Doesn't read great does it?

When there is a lot of prose (text) it can be difficult to read when
there are a lot of links in there.

I prefer to use the link text and reference it at the bottom of my
document, like this:

```md
# My awesome Markdown

Fathom Analytics recently added a feature for [custom domains] with
their service.

<!-- Links -->

[custom domains]: https://usefathom.com/blog/bypass-adblockers
```

## The other solution 🤯

So, I'd prefer to have the goal ID in the link but not cluttering up
my beautifully crafted Markdown with `a` tags everywhere. 😁

How do I do that then?

The way I worked out how to do it was to use a URL parameter and
intercept it in the `A` component.

In the Markdown I add the goal ID to the URL, on line 9:

```md {8-9}
# My awesome Markdown

Fathom Analytics recently added a feature for [custom domains] with
their service.

<!-- Links -->

[custom domains]:
  https://usefathom.com/blog/bypass-adblockers?goalId="IBQBRDPP"
```

This way the structure of the Markdown is unchanged making a much
nicer writing experience.

How to use the goal ID from the URL parameter?

First up I used an `onClick` handler to pull out the `goalId` for the
analytics provider.

Using the `URL(props.href).searchParams` means that I can pull out the
`goalId` using the `.get` function.

```js {3-8}
export const A = props => {
  const fa = useAnalytics()
  const onClick = () => {
    if (props.href.includes(`goalId`)) {
      const params = new URL(props.href).searchParams
      fa(params.get(`goalId`))
    }
  }

  return (
    <a {...props} onClick={onClick}>
      {props.children}
    </a>
  )
}
```

The only thing with this was that the `goalId` would still be in the
URL.

![url with goalid showing]

I didn't really like the way this looked, especially if someone was
going to share that link after clicking it.

So reading into the URL API a bit more and reading up on some
[StackOverflow posts] I found that I could delete the parameter after
using it.

In the next block of code here, on line 3, I'm checking if the
`props.href` contains a `goalId` parameter.

I can then manipulate the `props.href` in `useEffect` and setting the
`goalId` in state first on line 10.

Then I can delete the `goalId` from the `url` on line 11.

The props have been changed now so I'll need to provide the new `href`
to the `a` tag in the props, on line 25.

```js {3-5,7-14,17-19,25}
export const A = props => {
  const fa = useAnalytics()
  const containsGoalId = props.href.includes(`goalId`)
  const [goalId, setGoalId] = useState(``)
  const [newHref, setNewHref] = useState(``)

  useEffect(() => {
    if (containsGoalId) {
      const url = new URL(props.href)
      setGoalId(url.searchParams.get(`goalId`))
      url.searchParams.delete(`goalId`)
      setNewHref(url.href)
    }
  }, [containsGoalId, props.href])

  const onClick = () => {
    if (goalId) {
      fa(goalId)
    }
  }

  return (
    <a
      {...props}
      href={containsGoalId ? newHref : props.href}
      onClick={onClick}
    >
      {props.children}
    </a>
  )
}
```

Now clicking the link will only call the analytics provider when
there's a goal ID in the `href` passed to the component in the props.

## Here's a video 📺

In this video detail what I've been writing about.

<!-- cSpell:ignore Ihbx -->

<YouTube youTubeId="0BVIhZk" />

## Resources 📑

These resources helped me along the way.

- [MDN URL API]
- [MDN searchParams Delete]
- [SO Get Query String Values]
- [SO Remove Query String Values]
- [Google URLSearchParams]

<!-- Links -->

[my affiliate link]: https://usefathom.com/ref/HG492L
[track custom events]:
  https://scottspence.com/posts/track-custom-events-with-fathom-analytics/
[fathom goal]: https://usefathom.com/support/goals
[stackoverflow posts]: https://stackoverflow.com/a/12151322/1138354
[mdn url api]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[mdn searchparams delete]:
  https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/delete
[so get query string values]:
  https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
[so remove query string values]:
  https://stackoverflow.com/questions/22753052/remove-url-parameters-without-refreshing-page
[google urlsearchparams]:
  https://developers.google.com/web/updates/2016/01/urlsearchparams

<!-- Images -->

[url with goalid showing]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/url-with-goalid-showing-a8b55efd542a1abaf4905a646549dea6.png
