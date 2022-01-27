---
date: 2022-01-25
title: Reduce and Filter JavaScript Object on Property
tags: ['snippets', 'javascript']
isPrivate: true
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

How do you filter an object that has duplicate properties? Use reduce!
The situation is I had a list of objects with duplicate properties. I
wanted to filter out the duplicates and return a new object with only
the unique properties.

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
    "productId": "1",
    "slug": "laptop",
    "productName": "Laptop",
    "variant": "64gb"
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
build out the page details.

A mentor of mine, Leigh Halliday has done some great videos detailing
how to use reduce.

<YouTube youTubeId='28StAxSjyIU'/>

This is another good one brought to my attention by
[Joost Schuur](https://twitter.com/joostschuur) on Twitter.

<YouTube youTubeId='NiLUGy1Mh4U'/>

```js
$: products = items
  .reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item] = item
    }
    acc[item.productId] = item
    return acc
  }, [])
  .filter(item => item !== null)
```
