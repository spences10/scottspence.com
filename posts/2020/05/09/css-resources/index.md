---
date: 2020-05-09
title: CSS Resources From Around the Web
tags: ['css', 'resource']
isPrivate: false
---

<script>
  import Tweet from '$lib/components/tweet.svelte'
</script>

This is a collection of some handy snippets and resources I collected
which I'm going to be documenting here, it's probably going to be a
mess but it mainly for my reference.

Big thanks to Steve Schoger and Adam Wathan 🙏

Check out Refactoring UI and the Refactoring UI YouTube channel for
more hot tips 🔥

## Debugging

From **Adam Wathan:**

> Ever run into annoying CSS layout bugs that are hard to
> troubleshoot? (WHY IS THERE A HORIZONTAL SCROLLBAR WHERE IS THIS
> COMING FROM?!?)

> Throw this style into your dev tools to see the boundaries of every
> element without affecting the layout:

```css
* {
  outline: 1px solid red !important;
}
```

<Tweet tweetLink="adamwathan/status/959078631434731521" />

## Images

From **Steve Schoger:**

> Working with images that clash with each other? Try desaturating
> them to greyscale or colourising them all with a single colour to
> make them a little more cohesive.

![desaturating images]

> Also, containing photos in circles - Great way to make a bad photo
> look good

![circle images]

<Tweet tweetLink="steveschoger/status/950764423643320320" />

## Gradients

There is a lot of content out there for this but I have found some
quite nice ones.

Gradient maker: [cssgradient.io/gradient-backgrounds]

Nice Gradient Swatches: [gradientmagic.com]

Animated gradients, via Chris Biscardi, example: [animated gradients
Codesandbox]

<Tweet tweetLink="chrisbiscardi/status/1259606045858467840" />

## Colours

Community driven colour pallets: [colorhunt.co]

HSLA Colour picker: [A Most Excellent HSL Color Picker]

Colour contrast picker, this will give you a selection of colours with
a 4.5:1 ratio: [tanaguru contrast finder]

Leet speak and colours: [bada55.io]

For getting shades of a colour I lke to use 0to255 : [0to255.com]

Colour Space has a nice UI for creating colour pallets:
[mycolor.space]

Adobe Colour Wheel has good presets for picking colour pallets:
[color.adobe.com]

Automatic UI Colour Palette Generator: [palx.jxnblk.com]

Name a colour from hex: [color-hex.com]

Hello Colour: [jxnblk.com/hello-color]

Beautiful colour scales Colour Box: [colorbox.io]

Colour Scale: [hihayk.github.io/scale]

React colour tools: [react-color-tools.surge.sh]

## Internal browser colour names

I've asked this question a couple of times before, **"is there a way
to list the internal browser colours?"**

<Tweet tweetLink="spences10/status/1259077547683459073" />

The last time I asked [Mathias Bynens] answered!

<Tweet tweetLink="mathias/status/1259120846679035904" />

If you want the list go to the [the CSS3 spec] and run this snippet in
the dev console:

```js
;[
  ...document.querySelectorAll(
    '.named-color-table [id^="valdef-color-"]'
  ),
].map(element => element.textContent)
```

## Neumorphism

Neumorphism.io is a cool tool for generating your neumorphism boxes:
[neumorphism.io]

## Effects

Glitch Text Effect: [css-tricks.com/glitch-effect-text-images-svg]

Fancy Border Radius: [9elements.github.io/fancy-border-radius]

## Numbers in CSS

Width for elements changing when using numbers? Check:
[`font-variant-numeric`]

I asked and the community of course responded!

<Tweet tweetLink="spences10/status/1103650317554593793" />

I also found the original tweet I saw from Wes Bos back in 2017!

<Tweet tweetLink="wesbos/status/932644812582522880" />

## CSS Grid

CSS Grid has a good UI for building CSS Grid Layouts:
[layoutit.com/build]

## New CSS Logical Properties

New CSS Logical Properties!: [medium post]

<!-- Links -->

[cssgradient.io/gradient-backgrounds]:
  https://cssgradient.io/gradient-backgrounds/
[gradientmagic.com]: https://www.gradientmagic.com/#
[https://cssgradient.io]: https://cssgradient.io/
[neumorphism.io]: https://neumorphism.io/#55b9f3
[medium post]:
  https://medium.com/@elad/new-css-logical-properties-bc6945311ce7
[css-tricks.com/glitch-effect-text-images-svg]:
  https://css-tricks.com/glitch-effect-text-images-svg/
[`font-variant-numeric`]:
  https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric
[mycolor.space]: https://mycolor.space/?hex=%23663399&sub=1
[color.adobe.com]: https://color.adobe.com
[palx.jxnblk.com]: https://palx.jxnblk.com/
[bada55.io]: http://bada55.io/
[0to255.com]: https://www.0to255.com/
[color-hex.com]: https://www.color-hex.com/
[jxnblk.com/hello-color]: https://jxnblk.com/hello-color
[colorbox.io]: https://www.colorbox.io/
[hihayk.github.io/scale]: https://hihayk.github.io/scale
[eggradients.com]: https://www.eggradients.com/
[react-color-tools.surge.sh]: https://react-color-tools.surge.sh/
[worldvectorlogo.com]: https://worldvectorlogo.com/search/GraphQL
[layoutit.com/build]: https://www.layoutit.com/build
[desaturating images]: ./desaturatingImages.jpg
[circle images]: ./circleImages.jpg
[9elements.github.io/fancy-border-radius]:
  https://9elements.github.io/fancy-border-radius
[mathias bynens]: https://twitter.com/mathias
[the css3 spec]: https://drafts.csswg.org/css-color/#named-colors
[tanaguru contrast finder]: https://contrast-finder.tanaguru.com/
[animated gradients codesandbox]:
  https://codesandbox.io/s/muddy-sun-gp0el
[a most excellent hsl color picker]: http://hslpicker.com/
[colorhunt.co]: https://colorhunt.co/
