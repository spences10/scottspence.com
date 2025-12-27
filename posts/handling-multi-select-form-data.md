---
date: 2024-03-01
title: Handling Multi-Select Form Data
tags: ['javascript', 'sveltekit', 'how-to', 'guide']
is_private: false
---

How to get the array of selected values from a multi-select form
input?

This is a short post detailing my stupidity and how I overcame it. So,
here's the sitch! I was starting again with the
[dopedevs.icu](https://dopedevs.icu) project I started over 4 years
ago but never finished.

**Tl;Dr:** go to the [Conclusion](#conclusion) for the solution.

I wanted to have a nice way for users to submit a dev and technologies
via a form. I was using a multi select input to submit data to a form
action on the server.

## The set-up

This is a simplified version of the form and I've hard-coded the
values for the sake of brevity. Here's the form in SvelteKit:

```svelte
<script lang="ts">
  let name = 'Scott'
  let selected_country = 'gb'
  let selected_technologies: never[] = []
  let countries = [
    { value: 'gb', name: 'United Kingdom' },
    { value: 'us', name: 'United States' },
    { value: 'ca', name: 'Canada' },
    { value: 'fr', name: 'France' },
  ]
  let technologies = [
    { value: 'html', name: 'HTML' },
    { value: 'css', name: 'CSS' },
    { value: 'js', name: 'JavaScript' },
    { value: 'svelte', name: 'Svelte' },
    { value: 'react', name: 'React' },
    { value: 'vue', name: 'Vue' },
    { value: 'angular', name: 'Angular' },
  ]
</script>

<form method="POST" action="?/using_object_from_entries">
  <label for="name">Name:</label>
  <input type="text" name="name" bind:value={name} required />

  <label for="country">Country:</label>
  <select name="country" bind:value={selected_country} required>
    <option disabled value="">Select a country</option>
    {#each countries as country}
      <option value={country.value}>{country.name}</option>
    {/each}
  </select>

  <label for="technologies">Technologies:</label>
  <select
    name="technologies"
    bind:value={selected_technologies}
    multiple
    required
  >
    {#each technologies as technology}
      <option value={technology.value}>{technology.name}</option>
    {/each}
  </select>

  <button type="submit">Submit</button>
</form>
```

So far so good. The form is rendering as expected and I can select
multiple technologies from the multi-select dropdown (holding Ctrl and
clicking the item).

You've probably noticed the form action `?/using_object_from_entries`
this is action is <mark class='text-primary-content bg-primary'>NOT
THE RIGHT WAY</mark> to handle the form data.

Onto that now!

## What I was doing

Using a form action is SvelteKit is essentially a server endpoint that
handles the form submission in a `+page.server.ts` file. Basic outline
is something like this:

```typescript
import type { Action, Actions } from './$types'

const using_object_from_entries: Action = async ({ request }) => {
  const form_data = Object.fromEntries(await request.formData())

  console.log('=====================')
  console.log(form_data)
  console.log('=====================')
}

export const actions: Actions = { using_object_from_entries }
```

I'm using a named action here as I want to add in the correct way to
handle the form data. I'll get to that in a bit.

So, the form is essentially filled out apart from the technologies,
I'll select HTML, CSS and JavaScript, when I submit the form, I get
the following output in the console:

```plaintext
=====================
{ name: 'Scott', country: 'gb', technologies: 'js' }
=====================
```

This is not what I was expecting. I was expecting an array of
technologies, not just the last selected one.

## What I should have been doing

Ok, now to expand on the actions in the `+page.server.ts` file.

```typescript
import type { Action, Actions } from './$types'

const using_get_all: Action = async event => {
  const form_data = await event.request.formData()

  const name = form_data.get('name') as string
  const country = form_data.get('country') as string
  const technologies = form_data.getAll('technologies') as string[]

  console.log('=====================')
  console.log(name, country, technologies)
  console.log('=====================')
}

const using_object_from_entries: Action = async ({ request }) => {
  const form_data = Object.fromEntries(await request.formData())

  console.log('=====================')
  console.log(form_data)
  console.log('=====================')
}

export const actions: Actions = {
  using_get_all,
  using_object_from_entries,
}
```

Then over in the form, I'll change the form action to
`?/using_get_all` and submit the form again selecting the same things
from the multi-select dropdown.

The output in the console is now as expected, an array of selected
technologies:

```plaintext
=====================
Scott gb [ 'html', 'css', 'js' ]
=====================
```

If I dig into the code for the `using_get_all` action, here:

```typescript
const using_get_all: Action = async event => {
  const form_data = await event.request.formData()

  const name = form_data.get('name') as string
  const country = form_data.get('country') as string
  const technologies = form_data.getAll('technologies') as string[]

  console.log('=====================')
  console.log(name, country, technologies)
  console.log('=====================')
}
```

I'm now creating a variable for each form field and using the `get`
method to get the `name` value of the field on the form. For the
multi-select dropdown, I'm using the `getAll` method to get an array
of all the selected values.

This post from Dana Woodman was my aha! moment:

https://dev.to/danawoodman/getting-form-body-data-in-your-sveltekit-endpoints-4a85#accessing-form-data

Thanks Dana!

## Conclusion

When using `Object.fromEntries(await request.formData());` to convert
form data into an object, it does not automatically aggregate multiple
selections from a multi-select dropdown into an array.

This is fine for single-select fields, but for multi-select fields, it
only returns the last selected option as a string.

This is because `Object.fromEntries(await request.formData());`
iterates over each key-value pair in the form data, and for
multi-select fields, each selected option is treated as a separate
entry.

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

In summary, `Object.fromEntries(formData)` does not aggregate multiple
selections into an array because it treats each entry independently,
whereas `formData.getAll('key')` is designed to return all values for
a given key, making it suitable for multi-select fields.

Fin!
