---
date: 2024-03-01
title: Handling Multi-Select Form Data
tags: ['javascript', 'sveltekit', 'how-to', 'guide']
isPrivate: true
---

How to get the array of selected values from a multi-select form
input?

This is a short post detailing my stupidity and how I overcame it. So,
here's the sitch! I was reviving the
[dopedevs.icu](https://dopedevs.icu) project I started over 4 years
ago from using GraphCMS (I will always call it that!) over to using
Turso instead. Because, reasons!

**Tl;Dr:** go to the [Conculsion](#conculsion) for the solution.

I wanted to have a nice way for users to submit a dev and technologies
via a form. I was using a multi select input to submit data to a form
action on the server.

## What I was doing

## What I should have been doing

This post from Dana Woodman was my aha! moment:

https://dev.to/danawoodman/getting-form-body-data-in-your-sveltekit-endpoints-4a85#accessing-form-data

## Conculsion

When using `Object.fromEntries(formData)` to convert form data into an
object, it does not automatically aggregate multiple selections from a
multi-select dropdown into an array.

This is because `formData.entries()` iterates over each key-value pair
in the form data, and for multi-select fields, each selected option is
treated as a separate entry.

Therefore, when you convert this into an object using
`Object.fromEntries`, it overwrites the previous value for the same
key, resulting in only the last selected option being represented in
the object.

On the other hand, using `formData.getAll('selected_technologies')`
directly returns an array of all selected options for the specified
field because `getAll` is designed to return all values associated
with a given key from the form data.

This method is specifically useful for handling multiple selections in
a multi-select dropdown, as it aggregates all selected values into an
array, which is exactly what you need for handling such data on the
server side.

Here's a concise example to illustrate the difference:

```javascript
// Assuming formData is a FormData object from a form submission
const formData = new FormData(formElement)

// This will give you an object, but 'selected_technologies' will not be an array
const formObject = Object.fromEntries(formData)

// This will give you an array of all selected options for 'selected_technologies'
const selectedTechnologies = formData.getAll('selected_technologies')
```

In summary, `Object.fromEntries(formData)` does not aggregate multiple
selections into an array because it treats each entry independently,
whereas `formData.getAll('key')` is designed to return all values for
a given key, making it suitable for multi-select fields.

Fin!
