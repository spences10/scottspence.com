---
date: 2023-09-09
title: Airtable to Upstash Redis with SvelteKit
tags: ['sveltekit', 'redis', 'upstash']
isPrivate: false
---

Yesterday I switched my [URL link shortener](https://ss10.dev/links)
from Airtable to Upstash Redis. Airtable is great and I still use it
for a couple of features on this site, the contact from being one of
them. I am really enjoying using Upstash Redis for a lot of things now
and using it for the URL shortener to my mind was a good shout!

Using a short URL now gives a much faster response time, so that's a
win!

If you wanted to use Airtable for your URL shortener then you can
follow the guide I wrote for [SvelteKit Contact Form Example with Airtable].

Ok, so, I hope the preamble was enough reasoning, but, if not, here's
a list of reasons why I switched from Airtable to Upstash Redis.

## Why Switch from Airtable to Redis?

- Redis is generally faster than Airtable for read and write
  operations because it's an in-memory data store.

- Lower latency responses compared to Airtable.

- Upstash Redis is more a cost-effective solution.

- If that one link gets really popular then I'll get limited on the
  Airtable free tier.

You can take a look at the [PR] to see the changes I made to the
project.

## Migrating the data

With the data already in Airtable I needed to get it from there into
Redis. I could already access the data as a JSON object from the
Airtable API in the project, so I just copy and pasted that into a new
file ready to import into Redis.

The JSON data from Airtable looked like this.

```ts
export const airtable_json_data = [
	{
		id: 'rec03P0YflWl1x1x1',
		createdTime: '2022-07-21T18:40:13.000Z',
		fields: {
			destination: 'https://ten-facts.now.sh',
			source: '/10facts',
			position: 1,
			description: '10 Facts About Me',
			clicks: 3,
			visible: true,
		},
	},
	// rest of the data
]
```

Because I didn't need the `id`, `createdTime` or `field` object I did
some one off multi-cursor shenanigans and removed them leaving the
data like this.

```ts
export const airtable_json_data = [
	{
		destination: 'https://ten-facts.now.sh',
		source: '10facts',
		position: 1,
		description: '10 Facts About Me',
		clicks: 3,
		visible: true,
	},
	// rest of the data
]
```

I also removed the `/` from the `source` field as I didn't need it
there.

Then created a one off import for the data into Redis with each record
as hash with `hset` (a hash or a hash map, essentially mapping keys to
values).

```ts
const import_data_to_redis = async () => {
	for (const record of airtable_json_data) {
		const {
			destination,
			source,
			position,
			description,
			clicks,
			visible,
		} = record
		const redis_key = `short_url:${source}`

		// Import each record to Redis using hset
		await redis.hset(redis_key, [
			'destination',
			destination,
			'position',
			position,
			'description',
			description,
			'clicks',
			clicks,
			'visible',
			visible,
		])
	}
}

// Execute the function
import_data_to_redis().catch(console.error)
```

I added this code to the `lib/redis.ts` file and ran it with from
there to do the import.

In the past when I've used Redis I've always worked with a JSON object
as the value, this was because it's usually data I've processed and
want to use again without having to do the processing again.

## Why Use Hash Map Instead of JSON Object in Redis?

- Efficiency: Storing data in a hash map is generally more
  memory-efficient than using a JSON object.

- Atomic Operations: Redis allows you to perform atomic operations on
  these smaller types like counters within the hash map, which you
  can't do with a JSON object.

- Partial Updates: With hashes, you can update a single field without
  affecting the rest of the data. In contrast, a JSON object would
  require you to read and write the entire object for a single change.

- Readability: Nicer to look at the data in a nice table over a JSON
  object.

- Type Safety: Redis hash maps can better preserve the data types of
  your individual fields, which can be crucial for numerical
  operations. In contrast, JSON objects convert everything into
  strings.

## Downside of Redis over Airtable

I don't have the nice Airtable UI for quickly editing links now.
Because the project is for my own personal use I'm not adding
authentication to a one page site just so I can have a form to edit
stuff.

So how do I manage adding and removing stuff on there? Using the
Upstash Redis CLI.

## What about the conversion?

If you want to check out the details of the conversion from Airtable
to Redis then [PR] details the changes I made.

I could do another post on creating a similar project to this one but
that would be a third one on the same topic. Mind you I've done
several on contact forms with Airtable so who knows! 😅

## Conclusion

I'm really happy with the switch to Redis, it's faster and cheaper
than Airtable. I'm also happy with the way I can manage the data in
Redis, it's not as nice as Airtable but it's not too bad.

<!-- Links -->

[SvelteKit Contact Form Example with Airtable]:
	https://scottspence.com/posts/sveltekit-contact-form-example-with-airtable
[PR]: https://github.com/spences10/sveltekit-short-urls/pull/265
