---
date: 2023-01-06
title: Get document elements from a page
tags: ['how-to', 'browser', 'javascript']
isPrivate: false
---

Two situations over the last couple of days I've needed to do this and
I've had to look up the code to do it. So I thought I'd write it down
here so I can find it again.

This is being left here for me primarily as it's something I need to
do occasionally and I don't want to have to look it up every time.

If you find it useful, then that's a massive bonus for me 😊.

## Situation 1, get a list by `data-label`

With Revue closing down at the end of the January I wanted to get my
email list from them and it was taking forever for the export to turn
up. I was in that mindspace at the time and didn't want to switch
context as I needed to put the data elsewhere. So I thought I'd just
get the data from the page.

The data was in a massive table with each `td` having a `data-label`
**Email**, it looked like this:

```html
<td class="email" data-label="Email">
  <span>
    <a
      class="data-table__cell-link"
      href="/app/lists/654321/members/987654321"
    >
      someemail@hotmail.com
    </a>
  </span>
</td>
```

So, I just need to get the `data-label` where it's
`data-label='Email'` from the page then I can work with that.

In the browser console I can do this:

```js
let dataLabels = document.querySelectorAll("[data-label='Email']")
```

That will give me a node list of all the `td` elements with the
`data-label='Email'` I can then use `Array.prototype` to convert it to
an array and then use a `.forEach` to loop over it, logging out the
element text (`el.innerText`).

```js
Array.prototype.forEach.call(dataLabels, el => {
  console.log(el.innerText)
})
```

Then it was a case of copypasta to where I needed it.

A bit manual, but it worked and it was a lot quicker that the export
took to turn up 😂.

## Situation 2, get a list by element type

I wanted to do some quick analysis on the performance of
`scottspence.com/posts` and I wanted to get the total number of all
the posts on the page.

Each post is wrapped in an `article` element, so I just needed to get
a list of all the `article` elements on the page.

```js
let articles = document.querySelectorAll('article')
```

Then once I got the list, all I needed to do was get the length of the
resulting `NodeList`:

```js
articles.length
// 146
```

If you're interested in the performance of the page, then you can
check it out over on [Lighthouse Metrics].

## Expanding on the above

An expansion on this is, say I have a long list of heading id's on a
page and I want to make a table of contents.

Say I only want the `h2` headings, I filter on the element to see if
it includes `h2` in an if statement and then lg out the contents of
the element id and the text.

```js
let ids = document.querySelectorAll('[id]')

Array.prototype.forEach.call(ids, el => {
  if (el.localName.includes(`h2`)) {
    console.log(`#${el.id}`)
    console.log(el.innerText)
  }
})
```

That's it, if you found it useful consider sharing it for others to
benefit from too 😊.

Thanks.

<!-- Links -->

[lighthouse metrics]:
  https://lighthouse-metrics.com/lighthouse/checks/4fad27cb-2c64-456c-bacf-73dee564c945
