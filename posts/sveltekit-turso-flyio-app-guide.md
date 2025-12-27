---
date: 2024-04-12
title: SvelteKit Turso Fly.io App Guide
tags: ['sveltekit', 'flyio', 'turso', 'docker', 'guide']
is_private: false
---

I've been doing more stuff with Fly.io and Turso with SvelteKit. If
you're following my posts you'll know I've got a real nerd boner for
using Turso in anything I can cram it into at the moment!

Why Fly.io though? Just get a $5 VPS and use that! Skill issue! 😂
Well, sure, skill issue and time issue, insert "ain't nobody got time
for that" gif here! (I managed several company Linux boxes in the
past). With Fly, I'm essentially shipping a Node container on their
platform. This opens up the possibility of using Turso embedded
replicas and multi-tenant apps! I'm not doing that now though!

What I want to go through here is the basics of what you'll need to
get a project scaffolded out to connect to a serverless database,
display the data and deploy it to Fly.

<!-- cSpell:ignore TRACKID ALBUMID MEDIATYPEID Baltes Dirkscneider ARTISTID GENREID UNITPRICE ARTISTNAME Hartenfeller multitenant -->

The inspiration for doing this was a video from
[Philipp Hartenfeller](https://github.com/phartenfeller) that I caught
on [YouTube](https://www.youtube.com/watch?v=iO4VUbQ6ua4). You don't
want to use Turso? Check out his video!

This isn't a CRUD app it's an R app! 😂 This guide uses the
[chinook SQLite sample database](https://www.sqlitetutorial.net/sqlite-sample-database/).
So there's a load of tables and data to query. No need for user
generated content and authentication, although this can be added in,
it's out of the scope of this and the time I can spend writing it.

Although I have used and like Drizzle ORM on other projects I really
do prefer to just use SQL to query data.

So, no auth, no ORM, just raw dog SQL for getting data...

Still here? Good! So, this guide will go over the following:

- Actually getting a database you can use without having to make all
  the tables and add data!
- Use some Svelte 5 features, runes, yes
- Adding a local SQLite database to Turso
- Setting up queries to use in the project, including a full text
  search query
- Push the project to Fly.io

## Setting up the project

So, usual SvelteKit setup from the terminal. But, as I'll be using Fly
to deploy the finished project I'll be using Bun as the runtime and
package manager. Why? Well, deploying a SvelteKit Node project to Fly
can sometimes cause issues with CJS/ESM compatibility not being
handled and I found using Bun sidestepped this whole issue.

I'll spin up a new app using the create svelte command for Bun:

```bash
bun create svelte sveltekit-turso-flyio-app
```

I'll pick the following options:

- Skeleton project
- using TypeScript syntax
- All the additional options
  - Add ESLint for code linting
  - Add Prettier for code formatting
  - Add Playwright for browser testing
  - Add Vitest for unit testing
  - Try the Svelte 5 preview (unstable!)

For connecting to the Turso database I'll need to install the Turso
client:

```bash
bun i -D @libsql/client
```

Then because I'm using Bun I'll want to uninstall the SvelteKit auto
adapter and add in the Bun adapter:

```bash
bun uninstall @sveltejs/adapter-auto
bun i -D svelte-adapter-bun
```

Then configure the adapter in the `svelte.config.js` file:

```diff
- import adapter from '@sveltejs/adapter-auto';
+ import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
```

I'll also need to adjust the scripts in the `package.json` file to use
Bun:

```diff
"scripts": {
+  "start": "bun ./build/index.js",
-  "dev": "vite dev",
+  "dev": "bun vite",
-  "build": "vite build",
+  "build": "bunx --bun vite build",
-  "preview": "vite preview",
+  "preview": "bun vite preview",
  "test": "bun run test:integration && bun run test:unit",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
```

If you're following along and you haven't used Turso before, you'll
need to install the Turso CLI, it's a one liner from the
[Turso quickstart](https://docs.turso.tech/quickstart) page.

I'm using WSL so I'll use the Linux install command:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

I'll be going over all the Turso CLI commands in a later section.

Aight! Time to scaffold out the files for the server stuff, from the
terminal I'll add in the folder/directory and files with the following
commands:

```bash
mkdir src/lib/server
touch src/lib/server/{client,index,queries}.ts
```

I'll get that set up in another section, what I will need though is a
`.env` file with the secrets for the Turso client to connect to the
database, a one liner to create the file with:

```bash
touch .env && echo -e "TURSO_DB_URL=\nTURSO_DB_AUTH_TOKEN=" >> .env
```

That'll create a `.env` file in the root of the project with the
`TURSO_DB_URL` and `TURSO_DB_AUTH_TOKEN` secrets ready for populating
when I generate them.

Sweet! Now I'll get the database set up on Turso!

## Adding the database to Turso

So, the Turso CLI allows you to add a database via a file, so, I can
[download the chinook database zip](https://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip)
from the SQLite tutorial site I linked earlier.

Then with the CLI using the `--from-file` flag and pointing to the
extracted `chinook.db` file I can create a new database on Turso:

```bash
turso db create sveltekit-turso-flyio-app --from-file /mnt/c/Users/scott/Downloads/chinook.db
```

I'm going to need the database URL to add to my project secrets
(`.env` file), I can use the `show` command to get this:

```bash
turso db show sveltekit-turso-flyio-app
```

Also, I'll need to generate an auth token which I can do via the Turso
CLI too:

```bash
turso db tokens create sveltekit-turso-flyio-app
```

Add them to the `.env` file:

```env
TURSO_DB_URL=libsql://sveltekit-turso-flyio-app.turso.io
TURSO_DB_AUTH_TOKEN=the-generated-auth-token
```

Right! I'm now ready to set up the Turso client so I can query data
from the database!

## Setting up the Turso client

In the `src/lib/server/client.ts` file I created, I'll export a client
function, essentially I could do this:

```ts
import { env } from '$env/dynamic/private'
import { createClient, type Client } from '@libsql/client'

const { TURSO_DB_URL, TURSO_DB_AUTH_TOKEN } = env

export const turso_client = (): Client => {
  return createClient({
    url: TURSO_DB_URL as string,
    authToken: TURSO_DB_AUTH_TOKEN as string,
  })
}
```

But, what I should do is the responsible thing and add in some error
handling in there:

```ts
import { env } from '$env/dynamic/private'
import { createClient, type Client } from '@libsql/client'

const { TURSO_DB_URL, TURSO_DB_AUTH_TOKEN } = env

export const turso_client = (): Client => {
  const url = TURSO_DB_URL?.trim()
  if (url === undefined) {
    throw new Error('TURSO_DB_URL is not defined')
  }

  const auth_token = TURSO_DB_AUTH_TOKEN?.trim()
  if (auth_token === undefined) {
    if (!url.includes('file:')) {
      throw new Error('TURSO_DB_AUTH_TOKEN is not defined')
    }
  }

  return createClient({
    url: TURSO_DB_URL as string,
    authToken: TURSO_DB_AUTH_TOKEN as string,
  })
}
```

Ok, now, I'll export this function from the `src/lib/server/index.ts`
file, I'll also export the queries from here too, more on them in the
next section!

```ts
export * from './client'
export * from './queries'
```

Sweet! Now I can use the client to query some data! Now to get the
data!

## Setting up queries

I want to do a full text search query on the tracks table but also get
information on the album, artist, genre and track.

First up though, I want to have some initial data to show on the index
page, so I'll set up an initial query in the
`src/lib/server/queries.ts` file:

```sql
SELECT t.TrackId AS TrackId,
  t.Name AS Name,
  a.AlbumId AS AlbumId,
  a.Title AS Title,
  at.ArtistId AS ArtistId,
  at.Name AS ArtistName,
  g.Name AS Genre,
  g.GenreId AS GenreId
FROM tracks t
JOIN albums a ON t.AlbumId = a.AlbumId
JOIN artists at ON a.ArtistId = at.ArtistId
JOIN genres g ON t.GenreId = g.GenreId
LIMIT 50;
```

So, loads of SQL joins and shiz! Right? I'm not going to go into a
relational database fundamentals talk here, so, if you're not sure
what's happening here essentially getting the names off of the related
tables that includes the names for the album, artist and genre, so,
let's take a look at the data I retrieve if I did a straight up
`SELECT * FROM tracks LIMIT 3;`. It looks like this:

```text
TRACKID  NAME                                     ALBUMID  MEDIATYPEID  GENREID  COMPOSER                                             MILLISECONDS  BYTES     UNITPRICE
1        For Those About To Rock (We Salute You)  1        1            1        Angus Young, Malcolm Young, Brian Johnson            343719        11170334  0.99
2        Balls to the Wall                        2        2            1        NULL                                                 342562        5510424   0.99
3        Fast As a Shark                          3        2            1        F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman  230619        3990994   0.99
```

Whereas I want something a bit more descriptive, so, running the big
ass query with all the joins I get something like this:

```text
TRACKID  NAME                                     ALBUMID  TITLE                                  ARTISTID  ARTISTNAME  GENRE  GENREID
1        For Those About To Rock (We Salute You)  1        For Those About To Rock We Salute You  1         AC/DC       Rock   1
6        Put The Finger On You                    1        For Those About To Rock We Salute You  1         AC/DC       Rock   1
7        Let's Get It Up                          1        For Those About To Rock We Salute You  1         AC/DC       Rock   1
```

I'm keeping the IDs as well for cross linking to other pages. More on
that later!

Aight, so this is an SQL query, I'm not doing jack with this in a
TypeScript file!

In the `src/lib/server/queries.ts` file I'll import the Turso client
and `.execute` that query.

```ts
import { turso_client } from '.'

const client = turso_client()

export const get_initial_tracks = async (limit = 50) => {
  const tracks = await client.execute({
    sql: `SELECT t.TrackId AS TrackId,
            t.Name AS Name,
            a.AlbumId AS AlbumId,
            a.Title AS Title,
            at.ArtistId AS ArtistId,
            at.Name AS ArtistName,
            g.Name AS Genre,
            g.GenreId AS GenreId
          FROM tracks t
          JOIN albums a ON t.AlbumId = a.AlbumId
          JOIN artists at ON a.ArtistId = at.ArtistId
          JOIN genres g ON t.GenreId = g.GenreId
          LIMIT ?;`,
    args: [limit],
  })

  return tracks.rows
}
```

Essentially the SQL is in backticks and given to the client as the SQL
to run, the `args` are the arguments to pass to the SQL query, you may
have noticed the `LIMIT ?;` at the end of the query, that `?` will get
substituted with the `limit` argument.

Ok, so, this is going on a bit now, but, what I want to do here is
have a way for the user to be able to enter some text into an input
box and do a search against all the data in the database.

With that big boi query, I only get the first 50 rows, so, I'll need
to set up a virtual table that I can search against for anything
that's in the database.

So, now, time for some more SQL'ing! I'm going to shell into the Turso
database for this:

```bash
turso db shell sveltekit-turso-flyio-app
```

Then from the shell I'll create a virtual table that I can search
against, I'll do this in three steps.

1. Create the virtual (FTS5) table
2. Insert Data into the (FTS5) table (via big ass query)
3. Fuzzy query the (FTS5) table

First up, create the virtual table:

```sql
CREATE VIRTUAL TABLE tracks_fts USING fts5 (
  TrackId,
  Name,
  AlbumId,
  Title,
  ArtistId,
  ArtistName,
  Genre,
  GenreId,
  prefix = '2 3 4'
);
```

The prefix '2 3 4' is so that it's optimised for searches that are
that length, so searching for `Jamiroquai` if I enter `jam` I should
get a result matching that.

Then insert the data into the virtual table:

```sql
INSERT INTO
  tracks_fts (
    TrackId,
    Name,
    AlbumId,
    Title,
    ArtistId,
    ArtistName,
    Genre,
    GenreId
  )
SELECT
  t.TrackId,
  t.Name,
  a.AlbumId,
  a.Title,
  at.ArtistId,
  at.Name,
  g.Name,
  g.GenreId
FROM
  tracks t
  JOIN albums a ON t.AlbumId = a.AlbumId
  JOIN artists at ON a.ArtistId = at.ArtistId
  JOIN genres g ON t.GenreId = g.GenreId;
```

Then query the virtual table, so for `Jamiroquai` try:

<!-- cSpell:ignore Jamiroquai -->

```sql
SELECT * FROM tracks_fts WHERE tracks_fts MATCH 'jam';
```

Success, ok now `jag` for `Jagged Little Pill`?? Nothing? Ok, so, I
need to add in a `*` to the end of the search term to do a fuzzy
search:

```sql
SELECT * FROM tracks_fts WHERE tracks_fts MATCH 'jag*';
```

Then I get the result I'm looking for!

Cool! So, I just want to highlight that for now, as I'll be coming
back to that later!

For now I'll concentrate on getting the data from Turso into the
project!

## Get the data from Turso

Cool! I'll test out I'm getting data from the Turso database client
now. So, because this is a SvelteKit project I can use the `load`
function to go off and get data for the page on initial load.

Because the Turso client is server side I'll need to create a
`+page.server.ts` file at the root of the routes directory:

```bash
touch src/routes/+page.server.ts
```

Then add in a `load` function to get the initial tracks and return
them for use on the index page.

```ts
import { get_initial_tracks } from '$lib/server'

export const load = async () => {
  const tracks = await get_initial_tracks()

  return {
    tracks,
  }
}
```

In the `src/routes/+page.svelte` file I can then get the props from
the `load` function and display the data on the page.

As I'm just validating that I'm getting data through to the page I'll
use my trusty debug tool, the
`<pre>{JSON.stringify(data, null, 2)}</pre>` of the data!

```svelte
<script lang="ts">
  let { data } = $props()
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the
  documentation
</p>
```

That gives me some output that looks like this:

```json
{
  "tracks": [
    {
      "TrackId": 1,
      "Name": "For Those About To Rock (We Salute You)",
      "AlbumId": 1,
      "Title": "For Those About To Rock We Salute You",
      "ArtistId": 1,
      "ArtistName": "AC/DC",
      "Genre": "Rock",
      "GenreId": 1
    },
    {
      "TrackId": 6,
      "Name": "Put The Finger On You",
      "AlbumId": 1,
      "Title": "For Those About To Rock We Salute You",
      "ArtistId": 1,
      "ArtistName": "AC/DC",
      "Genre": "Rock",
      "GenreId": 1
    },
```

Cool! So, when the page loads I'm getting the data from the database,
so, what about searching for stuff? I'll come onto that, soon, first
better get this index page cleaned up a bit!

So, styling so far, I am a massive advocate for daisyUI however, so
I'll add that in:

```bash
npx svelte-add@latest tailwindcss --tailwindcss-typography --tailwindcss-daisyui
bun i
```

The `bunx` command currently doesn't work with the `svelte-add`, so,
I'm using the `npx` script then installing with bun.

That will configure Tailwind and the daisyUI plugin and add in the
files needed for the project.

```text
├── src
│   ├── routes
│   │   └── +layout.svelte
│   └── app.pcss
├── .prettierrc
├── package.json
├── postcss.config.cjs
├── svelte.config.js
└── tailwind.config.cjs
```

Added files, `+layout.svelte`, `app.pcss`, `postcss.config.cjs` and
`tailwind.config.cjs` are added to the project, with the other files
configured for Tailwind.

Serious, if you're following along and you have a stick up your butt
about Tailwind, that's cool! You can spend all the extra time you must
have on your hands hand writing the CSS, I'm not about that life for
an example app! 😂

Aight, I'll get the initial page layout going on using a table and the
handy styling utils from daisyUI:

```svelte
<script lang="ts">
  let { data } = $props()
</script>

<svelte:head>
  <title>Music Search - Chinook SvelteKit</title>
</svelte:head>

<p class="mb-2 text-xl font-light">
  This is the initial 50 tracks from the Chinook database
</p>

<div class="overflow-x-auto">
  <table
    class="table table-pin-rows table-pin-cols table-xs md:table-lg"
  >
    <thead>
      <tr class="text-xl">
        <th>Track</th>
        <th>Artist</th>
        <th>Album</th>
        <th>Genre</th>
      </tr>
    </thead>
    <tbody>
      {#each data.tracks as track (track.TrackId)}
        <tr class:hover={'bg-base-200'}>
          <td>{track.Name}</td>
          <td>{track.ArtistName}</td>
          <td>{track.Title}</td>
          <td>{track.Genre}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

The data from the `load` function in the `+page.server.ts` file is
received into the `+page.svelte` file via the Svelte 5 `props` rune
and then I'm looping through that with an each block to render out the
table.

Actually whilst I'm on the subject of runes, I'll swap out the slot in
the `+layout.svelte` file for the `props` rune, so, from this:

```svelte
<script>
  import '../app.pcss'
</script>

<slot />
```

To this:

```svelte
<script lang="ts">
  let { children } = $props()
  import '../app.pcss'
</script>

<main class="container mx-auto max-w-6xl flex-grow px-4">
  <h1 class="mb-2 mt-4 text-5xl font-bold text-primary">
    <a href="/">Chinook SQLite database</a>
  </h1>
  <ul class="mb-10 flex space-x-4 text-xl font-bold">
    <li><a href="/genre" class="link link-primary">Genres</a></li>
    <li><a href="/" class="link link-primary">Home</a></li>
  </ul>
  {@render children()}
</main>
```

Adding in some nav links and a title to the layout file along with
some tailwind container classes. The `/genre` link is a placeholder
for a genre page I'll add in later.

What I've done here is, instead of the `slot` I'm using the `children`
prop to render out the children of the layout file like a snippet.

Cool! A page with 50 tracks on it from the database! Bit pants right!
😂

Ok, I'll add in a search input now to use the full text search query.

## Adding a search input

Now I want to be able to utilise that full text search table I
created, so, I'm going to need to first make that query to the
database form the Turso client.

Essentially that select query I made earlier validating the search on
the search_track table, I'm going to group all the queries being used
in the project in the `src/lib/server/queries.ts` file.

This is going to be the same setup, passing the SQL to the client with
the argument for what is being searched.

Remember the `*` at the end of the search earlier, I'll add that in
now with some regex to escape any double quotes in the search term:

```ts
export const search_tracks = async (search_term: string) => {
  const escaped_search_term = `"${String(search_term).replace(/"/g, '""')}"*`

  const tracks = await client.execute({
    sql: `SELECT * FROM tracks_fts WHERE tracks_fts MATCH ?;`,
    args: [escaped_search_term],
  })

  return tracks.rows
}
```

So, now notice that the `get_initial_tracks` and the `search_tracks`
return the same variable name?

This is so that they can be swapped interchangeably.

More on that in a bit, for now though I want to way to get that data
from the server, so, I'll add in a new route for the search query.

The convention is to stick API call in a `src/routes/api` directory,
so I'll add a new search folder with a `+server.ts` file in there:

```bash
mkdir -p src/routes/api/search
touch src/routes/api/search/+server.ts
```

Then bang out a get to run the `search_tracks` query:

```ts
import { get_initial_tracks, search_tracks } from '$lib/server'
import type { Row } from '@libsql/client'
import { json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
  const search_term = url.searchParams.get('search_term')?.toString()

  let tracks: Row[] = []

  if (!search_term) {
    tracks = await get_initial_tracks()
  } else {
    tracks = (await search_tracks(search_term)) ?? []
  }

  return json(tracks)
}
```

Now I'm going to need to call this from the index page via a client
side fetch, I'm going to need to set up some state for the search term
and the results.

So, I'll add the `data.tracks` that comes in from the `load` function
as props then add that to state along with the `search_term`:

```ts
let tracks = $state(data.tracks)
let search_term = $state('')
```

Then to fetch the data from the server I'll add in a function to do
that:

```ts
const fetch_tracks = async () => {
  const res = await fetch(`/api/search?search_term=${search_term}`)
  const data = await res.json()
  tracks = data
}
```

Because I've added the tracks to state I'll also need to swap out the
`data.tracks` from the `each` loop in the table:

```diff
- {#each data.tracks as track (track.TrackId)}
+ {#each tracks as track (track.TrackId)}
```

Now whatever is is state is what will be rendered on the table.

Back to fetching the data now, so I'm going to be hitting that
`fetch_tracks` function to get the data from the server, so I'll want
to limit the amount of calls to the endpoint, so, I'll add in a
debounce function with a 300 millisecond delay to limit the amount of
calls to the server.

I'll need to add a `timer` variable to state as well, so I'll update
my state to accommodate that as well:

```ts
let tracks = $state(data.tracks)
let search_term = $state('')
let timer: string | number | NodeJS.Timeout | undefined = $state(300)
```

Then I'll add in the debounce function:

```ts
const handle_search = (e: Event) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    const target = e.target as HTMLInputElement
    search_term = target.value
    fetch_tracks()
  }, 300)
}
```

Ok, last up for the script stuff I'll want to add something in to
handle the input from the input box (which doesn't exist yet! 😅):

```ts
const handle_input = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.value === '') {
    search_term = ''
    tracks = data.tracks
  }
}
```

Now for the markup, for the value of the input I'll not bind that to
state as it need to go through the `handle_search` debounce function
first, so I'll add in the `on:input` to update the state and
`on:keyup` to run the search:

```svelte
<input
  type="search"
  placeholder="Search tracks, titles, albums, artists, genres..."
  class="input input-bordered input-primary mb-10 w-full"
  value={search_term}
  on:keyup={handle_search}
  on:input={handle_input}
/>
```

Code wall incoming!

Here's the full file:

```svelte
<script lang="ts">
  let { data } = $props()

  let tracks = $state(data.tracks)
  let search_term = $state('')
  let timer: string | number | NodeJS.Timeout | undefined =
    $state(300)

  const fetch_tracks = async () => {
    const res = await fetch(`/api/search?search_term=${search_term}`)
    const data = await res.json()
    tracks = data
  }

  const handle_search = (e: Event) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const target = e.target as HTMLInputElement
      search_term = target.value
      fetch_tracks()
    }, 300)
  }

  const handle_input = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.value === '') {
      search_term = ''
      tracks = data.tracks
    }
  }
</script>

<svelte:head>
  <title>Music Search - Chinook SvelteKit</title>
</svelte:head>

<input
  type="search"
  placeholder="Search tracks, titles, albums, artists, genres..."
  class="input input-bordered input-primary mb-10 w-full"
  value={search_term}
  on:keyup={handle_search}
  on:input={handle_input}
/>

<p class="mb-2 text-xl font-light">
  This is the initial 50 tracks from the Chinook database
</p>

<div class="overflow-x-auto">
  <table
    class="table table-pin-rows table-pin-cols table-xs md:table-lg"
  >
    <thead>
      <tr class="text-xl">
        <th>Track</th>
        <th>Artist</th>
        <th>Album</th>
        <th>Genre</th>
      </tr>
    </thead>
    <tbody>
      {#each data.tracks as track (track.TrackId)}
        <tr class:hover={'bg-base-200'}>
          <td>{track.Name}</td>
          <td>{track.ArtistName}</td>
          <td>{track.Title}</td>
          <td>{track.Genre}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

Cool! Now I have a nice little search bar from the index page to find,
title, tracks, artist, genres and albums!

## Wiring up the rest of the project

I've gone over the basic pattern I'll be using for the rest of the
routes now. The pattern is, make a query to get the data, add the data
to state, then render the data on the page via a page load.

This is quite a meaty section with a lot of code, so, only interested
in deploying to Fly.io?
[Skip to the next section](#deploying-to-flyio)!

So, remember the big ass query and all the fields it returned?
Currently I'm only using the names but I have the IDs for Track,
Artist, Album and Genre too. So, this means that I can start listing
more related stuff out from the initial search.

So, that's going to be a route with a parameter passed to it so that
can be used as an argument for a query, I'll get the routes and files
for that scaffolded out now with a load of terminal commands:

```bash
mkdir -p "src/routes/album/[album_id]" "src/routes/artist/[artist_id]" "src/routes/genre/[genre_id]" "src/routes/track/[track_id]"
touch src/routes/album/'[album_id]'/+page.{server.ts,svelte}
touch src/routes/artist/'[artist_id]'/+page.{server.ts,svelte}
touch src/routes/genre/'[genre_id]'/+page.{server.ts,svelte}
touch src/routes/genre/+page.{server.ts,svelte}
touch src/routes/track/'[track_id]'/+page.{server.ts,svelte}
```

I'll also want to link to each of these routes, so, in the `each`
block on the `src/routes/+page.svelte` page I'll add in links for each
one:

```svelte
{#each tracks as track (track.TrackId)}
  <tr class:hover={'bg-base-200'}>
    <td>
      <a href={`/track/${track.TrackId}`} class="link link-primary">
        {track.Name}
      </a>
    </td>
    <td>
      <a href={`/artist/${track.ArtistId}`} class="link link-primary">
        {track.ArtistName}
      </a>
    </td>
    <td>
      <a href={`/album/${track.AlbumId}`} class="link link-primary">
        {track.Title}
      </a>
    </td>
    <td>
      <a href={`/genre/${track.GenreId}`} class="link link-primary">
        {track.Genre}
      </a>
    </td>
  </tr>
{/each}
```

At the moment clicking on these isn't going to go anywhere so I'll
start adding in the content, as stated, these patterns have already
been detailed, now it's a case of repeating them for each route.

In the `src/lib/server/queries.ts` file I'll add in the query that's
going to give me some detail on the album with some transformation on
the milliseconds field to express the time in minutes and seconds:

```ts
export const get_album_by_id = async (album_id: number) => {
  const album = await client.execute({
    sql: `SELECT 
            a.Title AS AlbumTitle, 
            t.TrackId, 
            t.Name AS TrackName, 
            at.Name AS ArtistName,
            (t.Milliseconds / 60000) || 'm ' || ((t.Milliseconds % 60000) / 1000) || 's' AS Duration
          FROM 
            albums a
          JOIN 
            tracks t ON a.AlbumId = t.AlbumId
          JOIN 
            artists at ON a.ArtistId = at.ArtistId
          WHERE 
            a.AlbumId = ?;`,
    args: [album_id],
  })

  return {
    artist: album.rows[0].ArtistName,
    album: album.rows[0].AlbumTitle,
    tracks: album.rows,
  }
}
```

I'm also going to return the artist name and album title as well as
the tracks for the album, so in the
`src/routes/album/[album_id]/+page.server.ts` file:

```ts
import { get_album_by_id } from '$lib/server/queries'

export const load = async ({ params }) => {
  const album_id = parseInt(params.album_id)

  const { artist, album, tracks } = await get_album_by_id(album_id)

  return {
    artist,
    album,
    tracks,
  }
}
```

Then for the `src/routes/album/[album_id]/+page.svelte` file I'll add
in the props and render out the data, much like the
`src/routes/+page.svelte` pretty much copy paste changing some of the
details:

```svelte
<script lang="ts">
  let { data } = $props()

  const { artist, album, tracks } = data
</script>

<svelte:head>
  <title>{album} - Chinook SvelteKit</title>
</svelte:head>

<h1 class="mb-5 text-4xl font-bold text-primary">{album}</h1>
<p class="mb-10 text-3xl font-bold tracking-widest text-secondary">
  By {artist}
</p>

<div class="overflow-x-auto">
  <table
    class="table table-pin-rows table-pin-cols table-xs md:table-lg"
  >
    <thead>
      <tr class="text-xl">
        <th>#</th>
        <th>Track</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {#each tracks as track, i}
        <tr class:hover={'bg-base-200'}>
          <td>{i + 1}</td>
          <td>
            <a
              href={`/track/${track.TrackId}`}
              class="link link-primary"
            >
              {track.TrackName}
            </a>
          </td>
          <td>{track.Duration}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

Notice that I've liked the tracks as well, once that route is set up
I'll be able to click on the track and get more information on that...

Next up though, I'll do the artist by artist ID, so, in the
`src/lib/server/queries.ts` file I'll add in the query to get the
artist by ID, also add in a subquery to get the number of tracks on
the album:

```ts
export const get_albums_by_artist_id = async (artist_id: number) => {
  const albums = await client.execute({
    sql: `SELECT 
            a.AlbumId, 
            a.Title AS AlbumTitle, 
            at.Name AS ArtistName,
            (SELECT COUNT(*) FROM tracks t WHERE t.AlbumId = a.AlbumId) AS TrackCount
          FROM 
            albums a
          JOIN 
            artists at ON a.ArtistId = at.ArtistId
          WHERE 
            a.ArtistId = ?;`,
    args: [artist_id],
  })

  return {
    artist: albums.rows[0].ArtistName,
    albums: albums.rows,
  }
}
```

Same pattern for the `src/routes/artist/[artist_id]/+page.server.ts`
file, call the query and return the data:

```ts
import { get_albums_by_artist_id } from '$lib/server/queries'

export const load = async ({ params }) => {
  const artist_id = parseInt(params.artist_id)

  const { artist, albums } = await get_albums_by_artist_id(artist_id)

  return {
    artist,
    albums,
  }
}
```

Then for the `src/routes/artist/[artist_id]/+page.svelte` file I'll
add in the props and render out the data:

```svelte
<script lang="ts">
  let { data } = $props()

  const { artist, albums } = data
</script>

<svelte:head>
  <title>{artist} - Chinook SvelteKit</title>
</svelte:head>

<h1 class="mb-5 text-4xl font-bold text-primary">{artist}</h1>
<p class="mb-10 text-3xl font-bold tracking-widest text-secondary">
  Albums
</p>

<div class="overflow-x-auto">
  <table
    class="table table-pin-rows table-pin-cols table-xs md:table-lg"
  >
    <thead>
      <tr class="text-xl">
        <th>Title</th>
        <th>Tracks</th>
      </tr>
    </thead>
    <tbody>
      {#each albums as album}
        <tr class:hover={'bg-base-200'}>
          <td>
            <a
              href={`/album/${album.AlbumId}`}
              class="link link-primary"
            >
              {album.AlbumTitle}
            </a>
          </td>
          <td>{album.TrackCount}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

Again adding a link this time to the album page, so, I can click on
the album and get more information on that.

Next up, the genre by genre ID, so, in the `src/lib/server/queries.ts`
another query to get the albums by passing in the genre ID:

```ts
export const get_albums_by_genre = async (genre_id: number) => {
  const albums = await client.execute({
    sql: `SELECT 
            a.AlbumId, 
            a.Title AS AlbumTitle, 
            g.GenreId,
            g.Name AS GenreName,
            at.ArtistId,
            at.Name AS ArtistName
          FROM 
            albums a
          JOIN 
            tracks t ON a.AlbumId = t.AlbumId
          JOIN 
            genres g ON t.GenreId = g.GenreId
          JOIN 
              artists at ON a.ArtistId = at.ArtistId
          WHERE 
            g.GenreId = ?
          GROUP BY 
            a.AlbumId, a.Title, g.GenreId, g.Name, at.ArtistId, at.Name;`,
    args: [genre_id],
  })

  return {
    genre: albums.rows[0].GenreName,
    albums: albums.rows,
  }
}
```

In the `src/routes/genre/[genre_id]/+page.server.ts` file, call the
query and return the data:

```ts
import { get_albums_by_genre } from '$lib/server/queries.js'

export const load = async ({ params }) => {
  const genre_id = parseInt(params.genre_id)

  const { albums, genre } = await get_albums_by_genre(genre_id)

  return {
    albums,
    genre,
  }
}
```

Then the markup for the `src/routes/genre/[genre_id]/+page.svelte`
file to render out the data:

```svelte
<script lang="ts">
  let { data } = $props()

  const { albums, genre } = data
</script>

<svelte:head>
  <title>{genre} - Chinook SvelteKit</title>
</svelte:head>

<h1 class="mb-5 text-4xl font-bold text-primary">
  <a href="/genre">
    {genre}
  </a>
</h1>

<div class="overflow-x-auto">
  <table
    class="table table-pin-rows table-pin-cols table-xs md:table-lg"
  >
    <thead>
      <tr class="text-xl">
        <th>Album</th>
        <th>Artist</th>
      </tr>
    </thead>
    <tbody>
      {#each albums as album}
        <tr class:hover={'bg-base-200'}>
          <td>
            <a
              href={`/album/${album.AlbumId}`}
              class="link link-primary"
            >
              {album.AlbumTitle}
            </a>
          </td>
          <td>
            <a
              href={`/artist/${album.ArtistId}`}
              class="link link-primary"
            >
              {album.ArtistName}
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

More links to the album and artist pages, so, I can click on the album
and get more information on that and the artist.

Also I'll add in an index for the genre, so, in the
`src/lib/server/queries.ts` file a simple query to get all the genres
with no arguments passed to it:

```ts
export const get_genres = async () => {
  const genres = await client.execute(
    `SELECT GenreId, Name AS GenreName FROM genres ORDER BY Name;`,
  )

  return {
    genres: genres.rows,
  }
}
```

Then another server side route in the
`src/routes/genre/+page.server.ts` to call the query and return the
data:

```ts
import { get_genres } from '$lib/server/queries.js'

export const load = async () => {
  const { genres } = await get_genres()

  return {
    genres,
  }
}
```

Then the markup for the `src/routes/genre/+page.svelte` file to render
out the data:

```svelte
<script lang="ts">
  let { data } = $props()

  const { genres } = data
</script>

<svelte:head>
  <title>Genres - Chinook SvelteKit</title>
</svelte:head>

<ul class="list-disc pl-10 text-xl">
  {#each genres as { GenreName, GenreId }}
    <li>
      <a href={`/genre/${GenreId}`} class="link link-primary">
        {GenreName}
      </a>
    </li>
  {/each}
</ul>
```

Just a simple list of the genres that links back to the
`/genre/${GenreId}` route.

Finally the track by track ID, so, in the `src/lib/server/queries.ts`
file a query to get the track by ID:

```ts
export const get_track_by_track_id = async (track_id: number) => {
  const track = await client.execute({
    sql: `SELECT 
            t.TrackId, 
            t.Name AS TrackName, 
            a.AlbumId,
            a.Title AS AlbumTitle, 
            at.ArtistId,
            at.Name AS ArtistName,
            g.GenreId,
            g.Name AS GenreName,
            (t.Milliseconds / 60000) || 'm ' || ((t.Milliseconds % 60000) / 1000) || 's' AS Duration,
            mt.Name AS MediaType,
            t.UnitPrice AS Price
          FROM 
            tracks t
          JOIN 
            albums a ON t.AlbumId = a.AlbumId
          JOIN 
            artists at ON a.ArtistId = at.ArtistId
          JOIN 
            genres g ON t.GenreId = g.GenreId
          JOIN 
            media_types mt ON t.MediaTypeId = mt.MediaTypeId
          WHERE 
            t.TrackId = ?;`,
    args: [track_id],
  })

  return {
    artist: track.rows[0].ArtistName,
    track: track.rows,
    track_name: track.rows[0].TrackName,
  }
}
```

Then the server side route in the
`src/routes/track/[track_id]/+page.server.ts` file to call the query
and return the data:

```ts
import { get_track_by_track_id } from '$lib/server/queries.js'

export const load = async ({ params }) => {
  const track_id = parseInt(params.track_id)

  const { artist, track, track_name } =
    await get_track_by_track_id(track_id)

  return {
    track_name,
    artist,
    track,
  }
}
```

Then the markup for the `src/routes/track/[track_id]/+page.svelte`
file to render out the data:

```svelte
<script lang="ts">
  let { data } = $props()

  const { artist, track, track_name } = data
</script>

<h1 class="mb-5 text-4xl font-bold text-primary">{track_name}</h1>
<p class="mb-10 text-3xl font-bold tracking-widest text-secondary">
  <a href={`/artist/${track[0].ArtistId}`}>
    {artist}
  </a>
</p>

<svelte:head>
  <title>{track_name} - Chinook SvelteKit</title>
</svelte:head>

<div class="text-xl">
  <p><strong>Album Title:</strong> {track[0].AlbumTitle}</p>
  <p><strong>Genre Name:</strong> {track[0].GenreName}</p>
  <p><strong>Duration:</strong> {track[0].Duration}</p>
  <p><strong>Media Type:</strong> {track[0].MediaType}</p>
  <p><strong>Price:</strong> {track[0].Price}</p>
</div>
```

## Deploying to Fly.io

Ok, I've got a nice little example project I can share with the world
now!

I've already installed the Fly CLI from following the
[instructions from the Fly.io docs](https://fly.io/docs/hands-on/install-flyctl).

Fly makes getting a project set up straightforward with the
`fly launch` command:

```bash
fly launch
```

This configures the project, installs the `@flydotio/dockerfile`
package and creates several files, ones to note are the `fly.toml` and
the `Dockerfile`.

I'm asked set up options for the project and I leave most of them as
default apart from the primary region. It defaults to `lhr` (as I'm in
the UK) but I change it to `iad` as I've had issues in the past with
`lhr`.

Add in the Turso secrets at the top of the Dockerfile:

```dockerfile
ARG BUN_VERSION=1.1.0
FROM oven/bun:${BUN_VERSION}-slim as base

# Declare build arguments for secrets
ARG TURSO_DB_URL
ARG TURSO_DB_AUTH_TOKEN

LABEL fly_launch_runtime="Bun"
```

Then after the `COPY` commands add in the secrets for building the
app:

```dockerfile
# Copy application code
COPY --link . .

# Build application using build arguments
RUN TURSO_DB_URL=$TURSO_DB_URL TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN bun run build

# Remove development dependencies
RUN rm -rf node_modules && \
    bun install --ci
```

I'm now ready to deploy the app, I'll need to pass the build arguments
in the terminal, I've got into the habit now of exporting the secrets
to my terminal now so I can just use the variables in the command:

```bash
export TURSO_DB_URL=libsql://sveltekit-turso-flyio-app.turso.io
export TURSO_DB_AUTH_TOKEN=the-generated-auth-token
```

Then I can reference the variables from the terminal, so in the
terminal I do:

```bash
echo $TURSO_DB_URL
```

I'll get back the secret:

```text
the-generated-auth-token
```

So with the fly command I can use the variables for the deploy
command:

```bash
fly deploy --build-arg TURSO_DB_URL=$TURSO_DB_URL --build-arg TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN
```

The CLI gives me links to the Fly.io dashboard to inspect the build!

Done! 🎉

I'm not a Docker or Fly.io expert, this is from my trail and error
dicking around with multiple configurations and endless docs and
community posts searching.

If this is wrong or can be done better please [get in touch](/contact)
I'd love to make things right.

## Bonus! You want that CRUD?

Well, I'm not going to go into that here, but, I'll give you a
head-start!

Essentially all the tools you need to do that are in the project
they're just a form action away!

I'm not going down that path though as, like I stated at the beginning
if you're going to let any random person on the internet create and
delete data on the database then you're going to need to do a bit more
than the basics I have gone over here 😅

Things like authentication, possibly data scoped per user or a
database per user with something like the multi tennant approach in
the
[Creating a multitenant SaaS service with Turso, Remix, and Drizzle](https://turso.tech/blog/creating-a-multitenant-saas-service-with-turso-remix-and-drizzle-6205cf47)
on the Turso blog!

Have fun!
