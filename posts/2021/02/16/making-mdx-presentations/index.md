---
date: 2021-02-16
title: Making Presentations with MDX
tags: ['mdx', 'speaking', 'markdown']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

Ever since I first saw [Sara Vieira's slides] form Vue London 2018
I've really liked the idea of writing a presentation in MDX.

Sara used something [called MDX Deck] and it's pretty dope! You write
your slides in Markdown and sprinkle in other nice bits around what
you're saying in the slide, you know like most presentations. I made a
couple of presentations using MDX Deck.

In it's simplest form this is what a presentation can look like in
Markdown using MDX, the `---` indicates the separator for the slides.

```markdown
# slide 1

This is the first slide

---

## Slide 2

This is the second slide
```

I've tried several other solutions along the way, here they are
listed:

- MDX Deck
- Gatsby Theme MDX Deck
- [Next MDX Deck]
- [Fusuma]
- [MDXP]
- Untested by me but I did find [MDX Vue Deck]

The first two are the same really with using Gatsby shadowing (theme)
for MDX Deck in Gatsby Theme MDX Deck.

For a _really_ good example of using MDX Deck as a theme inside of a
Gatsby project check out [Sam Larsen-Disney]'s site, [sld.codes] and
the [presentations] pages inside there. Each presentation is it's own
MDX Deck slide deck. 🤯

## The OG!

MDX Deck is the OG of these and was a bit rough around the edges to
begin with (it's now at v4). I personally never had any joy using
anything above v1 when it came to using images in your presentations,
which my presentations relied on _a lot_.

I used MDX Deck happily for a couple of presentations but it always
irked me that certain support was missing causing a lot of people to
wonder if it was [still supported].

We get it, Jackson's a busy guy and OSS is, well OSS. So after I was
lined up to do talk about [Spreading the jamstack] at [Scale By the
Bay] I opted for something with a touch more features to use, this is
when I discovered Next MDX Deck when [Monica Powell] did a talk at MDX
conf.

## Next MDX Deck

Next MDX Deck had the `MDXProvider` exposed which means that I could
fold in components at a high level rather than have to import them on
the slide level.

This means that I can use [MDX Embed] and throw in Tweets, CodePens
and YouTube videos to my hearts content.

In the process of me doing the slides I need to do for [Tuesday] I
found I'm not the only one that procrastinates a touch when it comes
to making slides for a presentation.

No doubt Sarah's presentation is going to be 🔥

<Tweet tweetLink="sarah_edo/status/1357708732847644678" />

So whilst I was looking at doing my slides for the [MMT Tech Meetup] I
decided _not_ to go with Next MDX Deck and went about trying to find
an alternitive. See other solutions mentioned earlier on. 👍

## Prerequisites

There are a few options I need in the respect of making a slides
presentation.

These are all my _own_ preferences and by no way should define how you
select a deck for yourself. These are deal-breakers for me and my
use-cases however:

1. Speaker mode, the ability to present on one screen and have your
   notes on another.
1. The option to add images in any format, `.SVG`, `.png`, the rest.
1. Web publishing, people after the presentation can view them
   retrospectively.
1. Ability to add custom components and images, a nice sprinkling of
   Tweets and embeds are the life blood of what can otherwise be quite
   a dry presentation. 😂
1. Slide customisation, individual slide colours, effects, etc.

## FUSUMA

First alternitive I found was FUSUMA and it wasn't until I got into
the very important part of customisation of the slides that I found
the YAML file used to configure the theme and code blocks didn't work
on my setup (WSL behbeh).

Another main feature I look for is the ability to publish the slides
on a CDN somewhere so I can point people to the slides after the
presentation. This was another sticking point which I couldn't get
past so I carried on looking.

I'm sure FUSUMA is a great tool for presentations but didn't fit with
my use-case.

## MDXP

MDXP is not built in Gatsby or NextJS, it's a plain old React app with
an exposed webpack config file and all the requisite plugins for
images and Markdown + MDX.

MDXP comes with a set core of components for general use, `<Note>` is
great for presenter notes and there's a really handy one in `<Step>`
that allows you to, ahem 'step' through certain items on one slide.

## How it works

With MDXP there's still the top level index file which is used to wrap
the rest of the application, this is where the components for the
slides can be 'folded' in.

Here's an example of what that could look like:

```jsx {6,19}
/** @jsx jsx */
import * as components from '@mdxp/components'
import Deck, { Zoom } from '@mdxp/core'
import ReactDOM from 'react-dom'
import { jsx } from 'theme-ui'
import deckComponents from './deck-components'
import MDXPresentation from './presentation.mdx'
import theme from './theme/theme'

const Index = () => {
  return (
    <Zoom
      maxWidth={1000}
      width={1000}
      aspectRatio={16 / 9}
      sx={{ maxWidth: '100vw', maxHeight: '100vh' }}
    >
      <Deck
        components={{ ...components, ...deckComponents }}
        theme={theme}
      >
        <MDXPresentation />
      </Deck>
    </Zoom>
  )
}

ReactDOM.render(<Index />, document.getElementById('root'))
```

The `deckComponents` are what I provide, if I wanted to only use the
provided MDXP components I could stick with just those.

The `deck-components` file is where I can group all the components I
want to use in the presentation, here I'm bringing in a custom
`CodeHighlight` component that I can wrap code blocks in for the
presentation:

```jsx {1,5}
import CodeHighlight from './components/code'
import { Tweet, CodePen, YouTube } from 'mdx-embed'

export default {
  CodeHighlight,
  Tweet,
  CodePen,
  YouTube,
}
```

The `CodeHighlight` component can then be used in the slides, just
bear in mind that the component needs to wrap everything in that
slide. So if I wanted notes with the MDXP `<Note>` component they
could need to be contained by `<CodeHighlight>`.

I like the flexability of this because it means that the slides can
have an individual look and feel which is something that I've found
lacking in the alternitives.

## Wrap

So, for now, I'm all in with MDXP and I'll be looking to use it more
in the future.

If you're interested then take a look at the [example MDXP slides] for
an idea of what it's capable of doing.

There's also the [documentation] which does a great job of explaining
all the available components and concepts.

<!-- Links -->

[next mdx deck]: https://github.com/whoisryosuke/next-mdx-deck
[fusuma]: https://hiroppy.github.io/fusuma/
[mdx vue deck]: https://github.com/godkinmo/mdx-vue-deck
[mdxp]: https://0phoff.github.io/MDXP
[still supported]: https://github.com/jxnblk/mdx-deck/issues/765
[spreading the jamstack]: https://www.youtube.com/watch?v=L7_z8rcbFPg
[scale by the bay]: https://www.scale.bythebay.io/
[monica powell]: https://github.com/M0nica/migrating-to-mdx
[sam larsen-disney]: https://twitter.com/SamLarsenDisney
[sld.codes]: https://sld.codes/
[presentations]: https://sld.codes/presentations
[mdx embed]: https://www.mdx-embed.com/
[tuesday]:
  https://www.linkedin.com/events/mmttechmeetup-gatsbyjs-feb20216762857247988031488/
[mmt tech meetup]:
  https://www.linkedin.com/events/mmttechmeetup-gatsbyjs-feb20216762857247988031488/
[sara vieira's slides]: https://vue-apollo-magic.now.sh/#0
[called mdx deck]: https://github.com/SaraVieira/vue-graphql-love
[example mdxp slides]:
  https://0phoff.github.io/MDXP/examples/demo/#/normal/1/1
[documentation]: https://0phoff.github.io/MDXP/
