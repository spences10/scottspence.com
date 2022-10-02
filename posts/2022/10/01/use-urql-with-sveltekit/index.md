---
date: 2022-10-01
title: Use URQL with SvelteKit
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: true
---

In this guide I'll be going through getting set up with the Universal
React Query Library (URQL) in SvelteKit. There's [documentation] you
can check out for URQL itself if you need to go more in depth. This
will be covering initialising the client and making some simple
queries with it.

If you weren't aware, I did a [post on this] a while back, (or you may
have been directed here from that post, maybe?) but if you've been
following SvelteKit for a while now you'll know that [things have
changed slightly].

So, let's get started!

## GraphQL endpoint

This time around I'll be using the [Rick and Morty GraphQL API] for
the data, querying the [GraphQL endpoint] with URQL.

If I go to the endpoint (linked in the last paragraph) I can have a
play around with querying the data in the provided Graph<em>i</em>QL
explorer.

There's two queries I'll be using for this, one to get all the
characters from the API and another to get a single character by ID.

First up I'll query for all the characters available on the API, the
query is this:

```graphql
query AllCharacters {
  characters {
    results {
      name
      id
      image
    }
  }
}
```

I'll put that into the left side panel in the explorer and hit the
play button, this returns a list of all the characters in the API.

[![rickandmortyapi-graphiql]] [rickandmortyapi-graphiql]

The other query is for a single character by ID, I can add another
query to the explorer by clicking the plus button next to where it
says Graph<em>i</em>QL in the top right of the page. In that tab I'll
add in the following query:

```graphql
query GetCharacter($id: ID!) {
  character(id: $id) {
    name
    image
    status
    species
    location {
      name
      type
    }
    episode {
      name
    }
  }
}
```

This query takes an ID as a variable (`query GetCharacter($id: ID!)`),
I can add that in by clicking (and expanding) the Variables panel in
the explorer.

If I open up some curly boys (braces) `{}` in the Variables panel and
hit Ctrl+Space I get some intellisense for the available variables
that can be used, in this case it's only the `id` variable that I will
get an option for. If I select that and add in a value, say `1` and
then hit the play button I get the following response:

[![rickandmortyapi-graphql-single-character]]
[rickandmortyapi-graphql-single-character]

Now I have the two queries I need to start working with the data in a
SvelteKit project.

## Set up the SvelteKit project

I use `pnpm` for my package manager, but you can use `npm` or `yarn`,
I'll start by scaffolding a new SvelteKit project.

```bash
pnpm create svelte sveltekit-with-urql
```

The first part `pnpm create svelte` is what will run the CLI script to
create the project and the `sveltekit-with-urql` part is the name of
the folder I'll create the project in.

I'll pick the following options from the CLI, if you're following
along pick whatever makes you happy:

```bash
✔ Which Svelte app template? › Skeleton project
✔ Add type checking with TypeScript? › Yes, using JavaScript with JSDoc comments
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? › Yes
✔ Add Playwright for browser testing? › Yes
```

Then I can follow the

<!-- Links -->

[documentation]:
  https://formidable.com/open-source/urql/docs/basics/svelte/
[post on this]: https://scottspence.com/posts/use-urql-with-svelte/
[things have changed slightly]:
  https://github.com/sveltejs/kit/discussions/5774
[rick and morty graphql api]:
  https://rickandmortyapi.com/documentation/
[graphql endpoint]: https://rickandmortyapi.com/graphql
[example code]: https://github.com/spences10/sveltekit-with-urql

<!-- Images -->

[rickandmortyapi-graphiql]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1664657798/scottspence.com/rickandmortyapi-graphiql.png
[rickandmortyapi-graphql-single-character]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1664658680/scottspence.com/rickandmortyapi-graphql-single-character.png
