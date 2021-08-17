---
date: 2018-09-01
title: Shaving the Yak!
tags: ['productivity']
isPrivate: false
---

<script>
  import Details from '$lib/components/details.svelte'
  import YouTube from '$lib/components/youtube.svelte'
</script>

Don't save the yak! But put in the work so you're not wasting time.

[Marina Biletska] told me about this expression when we were working
on our [Chingu colabs] project together.

This initially came up in an issue I raised on the project we were
working on together ([grad.then()]) where I was having issues with
[ESLint linebreak style] and Marina left a link to a [Seth Godin
article].

## What's shaving the yak?

This YouTube video of Hal from Malcolm in the Middle beautifully
illustrates Yak Shaving. 👇

<Details buttonText="Expand to watch.">
  <YouTube youTubeId="AbSehcT19u0" />
</Details>

If you can't watch it from the video here's the description of what
happens.

Hal comes into the house from work and flicks the light switch in the
kitchen but the light doesn't work.

He proceeds to the cupboard to get a light bulb but on opening the
door notices that the shelf is missing a screw so he goes off to the
draw to fetch a screwdiver to fix the shelf.

On opening the draw to get the screwdriver he notices that the draw
rails are squeaking.

Off he goes to the garage to get some [WD-40], the WD-40 can is empty
so he decides that he now has to go out and get some.

He starts the car and notices there's something wrong with the car
engine.

Lois walks into the garage and asks Hal if could change the lightbulb
in the kitchen.

Hal rolls out from under the car he's repairing with his hands covered
in oil and screams "What does it look like I'm doing?" 😂

## Yak shaving in web development

It may seem like there's a lot of this in web development too. Want to
make a React site? Sweet, ok, so in your terminal, wait, you need to
install a terminal first if you don't have one.

Ok, now in your terminal run `npx create-react-app my-app`, oh, you'll
need to install Node which comes with `npm` and `npx`.

Got Node installed, sweet now `npx create-react-app my-app`, change
directory to `my-app` and open your text editor. I recommend VS Code,
you not got that installed?
[Download it here](https://code.visualstudio.com/).

So, you can see there's a few steps involved in what seems like a
trivial process once you have all the tooling you need.

## Where's the line?

At what point does it become yak shaving vs. what's needed to get up
and running?

Like with most things, it depends. 😬

If you're on a large team where you want codind standards enforced
then absolutely you'll need to have a linter like ESLint.

If you're making a small example project to share with someone then
spending the additional time to setup a linter is probably not worth
it.

## Resources

- [Seth Godin - Don’t Shave That Yak!]
- [Wiktionary - Ren and Stimpy reference]
- [Jason Lengstorf - meta-work]

<!-- Links -->

[seth godin article]:
  https://sethgodin.typepad.com/seths_blog/2005/03/dont_shave_that.html
[chingu colabs]: https://chingu.io/
[marina biletska]: https://github.com/mar-bi
[grad.then()]: https://github.com/chingu-voyage6/grad.then/issues/191
[eslint linebreak style]:
  https://github.com/chingu-voyage6/grad.then/issues/118#issuecomment-353569629
[update dependencies]:
  https://github.com/chingu-voyage6/grad.then/issues/191
[wd-40]: https://en.wikipedia.org/wiki/WD-40
[seth godin - don’t shave that yak!]:
  https://seths.blog/2005/03/dont_shave_that/
[wiktionary - ren and stimpy reference]:
  https://en.wiktionary.org/wiki/yak_shaving
[jason lengstorf - meta-work]: https://www.jason.af/yak-shaving
