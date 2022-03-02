---
date: 2022-03-02
title: Make a Contact Form with SvelteKit and Airtable
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: false
---

In this how to I'll be walking you through the process of creating a
contact form in SvelteKit using Airtable for storing the submissions.

I got the inspiration for doing this when a saw a video on YouTube
from WebJeda on [Sveltekit Contact Form using Google Forms]. Sharath's
video is great but I'm not a fan of using Google products so thought
I'd try the same approach with Airtable.

So, time for the standard preamble of the reasoning behind why a
contact form on your site is a good thing; Having a contact form on
your site is a great way to get people to get in touch with you. I'm
not opposed to adding my email address to my website but some people
prefer to contact you from the context of the site.

Ok, preamble done let's get to the actual content!

## Create the project

I'll be doing this from scratch so you can follow along then implement
what you need from this example into your own project.

I'll start with creating a new project in SvelteKit.

```bash
npm init svelte@next svelte-and-airtable-contact-form-example
```

I'll select the following options from the CLI:

```text
✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … No
✔ Add ESLint for code linting? … No
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … No
```

The I'll follow the rest of the steps from the CLI output:

```text
Next steps:
  1: cd svelte-and-airtable-contact-form-example
  2: npm install (or pnpm install, etc)
  3: git init && git add -A && git commit -m "Initial commit" # (optional)
  4: npm run dev -- --open
```

I use `pnpm` so will be using that in the terminal examples, you can
use `npm` or `yarn` if you prefer. Live your life! 😁

Ok, now I have the project set up I can go about getting the backend
set up with Airtable.

## Set up Airtable

So, Airtable is like a hosted version of MS Excel, simply put it's a
database with a nice UI. If you don't have an Airtable account you can
[sign up] over on the Airtable website.

I'll scroll to the bottom of the page and there's a '+ Add a
workspace' option. CLick that ans select 'Create workspace', I'll be
prompted to give it a name I'll call it `form-submissions`, then I can
'Add a base'. Clicking 'Add a base' gives me the following screen:

[![airtable-untitled-base]] [airtable-untitled-base]

From here I can rename the 'Untitled Base' to `contact-requests` and
'Table 1' to `submissions`. I can go through the fields on there now
and customise each field type by clicking on the small down arrow next
to the field name.

[![airtable-customise-field]] [airtable-customise-field]

In my example I'll add the following fields by renaming them and
changing the types with the 'Customize field type' option.

- 'name' as a 'Single line text' field
- 'email' as a 'Email' field
- 'message' as a 'Long text' field

You can add in any additional fields you want to store in Airtable.

## Set up Svelte form

For the contact form I'll make a Svelte component, that can be used
anywhere in the project so I'm not bound to having it in one place
like a (like a `https://mysite.com/contact`) route.

I'll create the `lib` folder and the `contact-form.svelte` file via
the terminal:

```bash
# create the directory/folder
mkdir src/lib
# create the Svelte component file
touch src/lib/contact-form.svelte
```

In the contact form component I'll create a simple form first, I'll
share a **full example later**.

```html
<form>
  <label for="name">
    <span>Name</span>
  </label>
  <input
    type="text"
    name="name"
    aria-label="name"
    placeholder="Enter your name"
    required
  />
  <label for="email">
    <span>Email</span>
  </label>
  <input
    type="email"
    name="email"
    aria-label="email"
    placeholder="bill@hotmail.com"
    required
  />
  <label for="message">
    <span>Message</span>
  </label>
  <textarea
    name="message"
    aria-label="name"
    placeholder="Message"
    required
    rows="3"
  />
  <input type="submit" />
</form>
```

Now I import the form for use in the project now, as there's only a
home page (`src/routes/index.svelte`) at the moment I'll add it there.

```svelte
<script>
  import ContactForm from '$lib/contact-form.svelte'
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the
  documentation
</p>

<ContactForm />
```

Now 

## Set up Sveltekit endpoint

<!-- Links -->

[sveltekit contact form using google forms]:
  https://www.youtube.com/watch?v=mBXEnakkUIM
[sign up]: https://airtable.com/signup

<!-- Images -->

[airtable-untitled-base]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1646207112/scottspence.com/airtable-untitled-base.png
[airtable-customise-field]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1646207766/scottspence.com/airtable-customise-field.png
