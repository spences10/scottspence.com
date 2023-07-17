---
date: 2023-07-16
title: SvelteKit Page Reaction Component with Upstash Redis
tags: ['sveltekit', 'redis', 'upstash', 'how-to']
isPrivate: true
---

I made a reactions component in SvelteKit that uses Upstash Redis to
store the user reactions. It uses a SvelteKit form action to submit
the reaction to the server. It's a nice example of how to use Upstash
with SvelteKit.

I'll go through creating the project so you can follow along if you
like or you can Tl;Dr and go to the [example](#example) if you like

## Create the Upstash Redis Database

Upstash make it really straightforward to create a Redis database.

Go to https://console.upstash.com/login and create an account if you
don't have one already.

In the Redis databases section I'll click on the 'Create Database'
button. I'm them prompted to give the database a name, I'll call it
`sveltekit-reactions`.

For the type I can choose between 'Global' or 'Regional'. I'll go with
the default 'Global' option.

The primary region I'll go with where the project will be built which
will eventually be on Vercel so I'll go with `us-west-2`. For the read
region I'll go with `us-west-1`.

I'll leave the rest of the options as the default and click the
'Create' button.

[![sveltekit-page-reactions-redis-details-dashboard]]
[sveltekit-page-reactions-redis-details-dashboard]

Take note of the 'REST API' section here, I'll need the
`UPSTASH_REDIS_REST_URL` and the ` UPSTASH_REDIS_REST_TOKEN` to go
into the `.env` file in the project.

Which brings me to the next step.

## Create the SvelteKit Project

Aight! Now I can scaffold out the SvelteKit project. I'll add in the
terminal commands if you want to follow along, I'll kick off the
SvelteKit CLI with the `pnpm create` command.

```bash
pnpm create svelte sveltekit-reactions
```

I'll pick the following options:

```text
create-svelte version 5.0.2

┌  Welcome to SvelteKit!
│
◆  Which Svelte app template?
│  Skeleton project
│
◆  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◆  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting
│  ◼ Add Prettier for code formatting
│  ◼ Add Playwright for browser testing
│  ◼ Add Vitest for unit testing
└
```

Then change directory into the project and install the dependencies I
need, right now I'll install `@upstash/redis` and `@upstash/ratelimit`
as dev dependencies.

```bash
cd sveltekit-reactions
pnpm i -D @upstash/redis @upstash/ratelimit
```

So I'm not messing around with styling I'll install Tailwind CSS with
the daisyUI and Tailwind typography plugins with `svelte-add`.

```bash
npx svelte-add@latest tailwindcss --daisyui --typography
# install configured dependencies
pnpm i
```

Now a quick check to see if everything is working as expected.

```bash
pnpm run dev
```

Sweet! So, now onto creating the form component with the reactions.

## Create the Reactions Component

I'll create the folders and files I need now for the project. First,
the reactions component which I'm going to put in the
`src/lib/components` directory. The `-p` flag will create the parent
directory if it doesn't exist.

Then create additional files for configuring the component, a utils
file for re-useable functions and another file for the Upstash Redis
client.

I'll do that with the following commands.

```bash
# make the components lib directory
mkdir src/lib/components -p
# make the reactions component
touch src/lib/components/reactions.svelte
touch src/lib/{config,redis,utils}.ts
# add the page server file fo the form action
touch src/routes/+page.server.ts
```

The component will be a form that will submit the reaction to the
server via a SvelteKit form action.

I'll scaffold out the component first then move onto the form action.

Rather than have a predefined set of reactions I'll make it so that
the user can add their own reactions in the `src/lib/config.ts` file.

I'll also add in the config for the Upstash `Ratelimit.slidingWindow`
here as well, ten requests inside a ten second window. (👈 more on
this later)

```ts
export const reactions = [
  { type: 'likes', emoji: '👍' },
  { type: 'hearts', emoji: '❤️' },
  { type: 'poops', emoji: '💩' },
  { type: 'parties', emoji: '🎉' },
]

export const limit_requests = 10
export const limit_window = '10 s'
```

Then in the `src/lib/components/reactions.svelte` file I'll import the
reactions from the config file and use them in the component.

```svelte
<script lang="ts">
  import { reactions } from '$lib/config'
</script>

<div class="flex justify-center">
  <form
    method="POST"
    action="/"
    class="grid grid-cols-2 gap-5 sm:flex"
  >
    {#each reactions as reaction}
      <button
        name="reaction"
        type="submit"
        value={reaction.type}
        class="btn btn-primary shadow-xl text-3xl font-bold"
      >
        <span>
          {reaction.emoji}
        </span>
      </button>
    {/each}
  </form>
</div>
```

I've added some Tailwind and daisyUI classes to the form for some
basic styling.

So, for now I just want to render out the emoji reaction as I've not
wired up the count from redis yet.

I have added a `POST` method to the form and a `name` and `type`
attribute to the button. This will be used in the form action to get
the value of the button that was clicked.

I also added in the `action` attribute which points to where the
action is located, in my case I'm going to create the action in the
`src/routes/+page.server.ts` file so I'll use `/` for the route.

So I can see what's going on with the component as a build it out I'll
stick the component on the index page.

```svelte
<script lang="ts">
  import Reactions from '$lib/components/reactions.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Reactions />
```

If I click one of the buttons now I get a `405` error telling me that
a `POST` method is not allowed as there are no actions for the page.

I'll create the form action next.

## Create the Form Action

Now I want to get the forma action working so I can get the value of
the button that was clicked and send it to the server.

In the `src/routes/+page.server.ts` file I'll add in an actions
object, in this case I'm going to need only the default action.

In the default action I'll need the form data which I can get out of
the `event.request` which will be `name` and `value` of the button
that was clicked. I can then get the `reaction` out of the `data`
object.

The last thing I'll need is the `path` which will be the page the
component is on. The prop for this isn't in the component yet so I'll
need to add that in later.

For now I want to validate the action is working so I'll just log out
the data to the console.

```ts
export const actions = {
  default: async ({ request, url }) => {
    const data = await request.formData()
    const reaction = data.get('reaction')
    const path = url.searchParams.get('path')

    console.log('=====================')
    console.log(data)
    console.log(reaction)
    console.log(path)
    console.log('=====================')
    return {}
  },
}

export const load = async () => {
  return {}
}
```

I'll return and empty object for the `default` action and the `load`
function for now.

Clicking on one of the buttons now I can see the data in the terminal
where the dev server is running.

```bash
=====================
FormData { [Symbol(state)]: [ { name: 'reaction', value: 'likes' } ] }
likes
null
=====================
```

Cool, so I now have the base of what I want to store in Redis.

## Add the Redis Client

Now I'll set up the redis client, I'll first need to create a `.env`
file to add the Upstash API keys to. I'll create the `.env` file in
the root of the project from the terminal.

```bash
touch .env
```

Then get the REST API keys from my Upstash dashboard, I'll scroll to
the REST API section, select the `.env` option then use the handy copy
option and paste them into the `.env` file.

[![sveltekit-page-reactions-redis-dashboard-env-keys]]
[sveltekit-page-reactions-redis-dashboard-env-keys]

Now I can import the keys into the `src/lib/redis.ts` file and create
the Redis client and initialise Upstash Ratelimit. I'll also add in
the config for the Upstash `Ratelimit.slidingWindow` here as well.

```ts
import { building } from '$app/environment'
import {
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from '$env/static/private'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { limit_requests, limit_window } from './config'

let redis: Redis
let ratelimit: Ratelimit

if (!building) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  })

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit_requests, limit_window),
  })
}

export { ratelimit, redis }
```

I'm checking if the app is building and if it's not I'll create the
Redis client and initialise Upstash Ratelimit and export these for use
in the `src/routes/+page.server.ts` file.

## Add reactions to Redis

Now I can check the connection is working and start adding the
reactions to the Upstash Redis database on button click.

I won't go into the specifics of Redis here as there are plenty of
resources out there for that. Essentially it's a key value pair, the
key in this case being the reaction and the page it was clicked on.

I want to know the page the reaction was clicked on so that's why I'm
passing in the `path` to the form action. So when I create the key I
can use the `path` and the `reaction` to create a unique key.

If I use the component on the about page and someone clicks the like
button the key in the Redis databse will be `about:likes`. I'm then
using the [`incr`] method to increment the value of the key by one.

```ts
import { redis } from '$lib/redis.js'

export const actions = {
  default: async ({ request, url }) => {
    const data = await request.formData()
    const reaction = data.get('reaction')
    const path = url.searchParams.get('path')

    const redis_key = `${path}:${reaction}`

    const result = await redis.incr(redis_key)

    return {
      success: true,
      status: 200,
      reaction: reaction,
      path: path,
      count: result,
    }
  },
}

export const load = async () => {
  return {}
}
```

Once the key is created and the value is incremented I can return the
data to the client. I'll return the `reaction`, `path` and the `count`
which is the value of the key.

In the component which is calling the action I can now receive the
`data` as a prop to the component.

## Show the count

Ok, in my component/form I can now accept a `data` prop which will
have the `reaction`, `path` and `count` from the server in it. But the
data from the server isn't going back to the component it's going back
to where the component is being used.

So, in my index page I'll need to accept the `data` prop coming back
from the server (form action) which I can then pass to the component.

On the index page I'll accept the `data` prop to the page and pass
that to the component.

I'll also add in a `pre` tag to help me understand the shape of the
data.

```svelte
<script lang="ts">
	import Reactions from '$lib/components/reactions.svelte';

	export let data: any;
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Reactions {data}/>
```

Now I can pass the `data` prop to the component and use it to show the
count of the reaction.

```svelte
<script lang="ts">
	import { reactions } from '$lib/config';

	export let data: any;
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<div class="flex justify-center">
	<form
		method="POST"
		action="/"
		class="grid grid-cols-2 gap-5 sm:flex"
	>
		{#each reactions as reaction}
			<button
				name="reaction"
				type="submit"
				value={reaction.type}
				class="btn btn-primary shadow-xl text-3xl font-bold"
			>
				<span>
					{reaction.emoji}
				</span>
			</button>
		{/each}
	</form>
</div>
```

Yes, I'm using an `any` type here, I'll fix that later.

## Example

Ok, I've gone through the steps to create this component. If you just
want to check out the example of the source code you can see the
[example repo on GitHub] and the [live demo].

## Thanks

Thanks to Jamie Barton for giving me the idea for this component where
he does something similar with [Grafbase]. There's also the [Upstash
claps] repo which is a Next.js example.

Thanks to [Geoff Rich] for his great posts on rate limiting with Redis
and SvelteKit on the [Upstash blog].

<!-- Links -->

[example repo on github]:
  https://github.com/spences10/sveltekit-reactions
[live demo]: https://sveltekit-reactions.vercel.app
[grafbase]:
  https://grafbase.com/guides/add-reactions-to-your-sveltekit-pages-with-graphql-and-form-actions
[upstash claps]: https://github.com/upstash/claps
[Geoff Rich]: https://geoffrich.net
[Upstash blog]: https://upstash.com/blog/sveltekit-rate-limiting
[`incr`]: https://redis.io/commands/incr

<!-- Images -->

[sveltekit-page-reactions-redis-details-dashboard]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1688893637/scottspence.com/sveltekit-page-reactions-redis-details-dashboard.png
[sveltekit-page-reactions-redis-dashboard-env-keys]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1689607340/scottspence.com/sveltekit-page-reactions-redis-dashboard-env-keys.png
