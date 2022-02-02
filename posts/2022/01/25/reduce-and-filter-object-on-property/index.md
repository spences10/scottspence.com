---
date: 2022-01-25
title: Reduce and Filter JavaScript Object on Property
tags: ['snippets', 'javascript']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

How do you filter a JavaScript object that has duplicate properties?
Use reduce! The specific situation I had is a list of objects with
duplicate properties. I wanted to filter out the duplicates and return
a new object with only the unique properties.

Here's a small example of what the object looked like:

```json
[
  {
    "productId": "1",
    "slug": "laptop",
    "productName": "Laptop",
    "variant": "16gb"
  },
  {
    "productId": "1",
    "slug": "laptop",
    "productName": "Laptop",
    "variant": "32gb"
  },
  {
    "productId": "2",
    "slug": "tablet",
    "productName": "Tablet",
    "variant": "32gb"
  },
  {
    "productId": "2",
    "slug": "tablet",
    "productName": "Tablet",
    "variant": "128gb"
  }
]
```

I'd be using the different variants on another part of the project so
they weren't really relevant here. All I really needed was the
`productName` and some other details that I've not added to the
example object here.

A lot of the examples you'll see on using reduce will be to count up a
value, in my case I needed to have only the relevant information to
add back into an object to build out the page details.

A mentor of mine, Leigh Halliday has done some great videos detailing
how to use reduce.

If you want a really good explanation of how to use filter, map and
reduce go check out Leigh's videos!

<YouTube youTubeId='28StAxSjyIU'/>

This is another good one brought to my attention by
[Joost Schuur](https://twitter.com/joostschuur) on Twitter.

<YouTube youTubeId='NiLUGy1Mh4U'/>

So, my specific use-case! I'll first set up the `.reduce` function
with the `acc`umulator (the thing I'm adding to) and the current
`item` in the reduce then return the `acc` which is what I want at the
end of the reduce. Then finally add the initial value of the reduce
which I want returned, in this case it's an array `[]`.

```js
items.reduce((acc, item) => {
  return acc
}, [])
```

Great I get an empty array back. So now I need to start adding items
to the `acc`.

I'll set up a check to see if the `item.productId` is already in the
`acc` and if it's not add it to the `acc` an if statement adding the
`item` to the `acc`.

Then I'll add the matching `item` for the `productId` to the `acc`.

```js
items.reduce((acc, item) => {
  if (!acc[item.productId]) {
    acc[item] = item
  }
  acc[item.productId] = item
  return acc
}, [])
```

There's an empty slot in the `acc` for the `productId` so I'll add a
`.filter` to the end of the `.reduce` so that any items that are
`null` are removed from the `acc`.

Here's the finished code:

```js
const products = items
  .reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item] = item
    }
    acc[item.productId] = item
    return acc
  }, [])
  .filter(item => item !== null)
```

That's it! Hope you found it useful!
