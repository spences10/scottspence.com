---
date: 2022-07-03
title: Prisma, SvelteKit and PlanetScale deployment issues on Vercel
tags: ['sveltekit', 'planetscale', 'prisma', 'vercel']
isPrivate: false
---

<script>
  import { Tweet, YouTube } from 'sveltekit-embed'
</script>

Here's some of the issues I faced when deploying a SvelteKit project
using Prisma to Vercel.

I was following along with the [awesome guide] put together by
[Matia], on authentication with SvelteKit using cookies. By far the
most comprehensive guide covering it with SvelteKit I have found.
There's also a [video playlist] covering it as well if you want to
check that out.

If you're just here for the **"how'd you get it working on Vercel
dammit??!1"** then you can skip to the [TL;DR](#scripts). 😊

This isn't a guide, more of a what I did along the way to getting this
project deployed to Vercel. I'll try to add as much information that I
found useful along the way.

So after following Matia's guide I wanted to deploy the finished
project to test it out 'in the wild'. So for that I needed to have a
database to connect to.

## Get a database to connect to

<!-- cSpell:ignore Nikolas -->

I did find a guide for [how to set up a free PostgreSQL database on
Heroku] by Nikolas Burk in the Prisma documentation.

But I heard good things about [PlanetScale] so decided to give that a
try. I followed along with the [Prisma with PlanetScale quickstart].

The first thing I needed was the PlanetScale CLI, I'm a Windows
Subsystem for Linux (WSL) user so needed to install the Linux version,
this was a download from the
[releases](https://github.com/planetscale/cli/releases/latest) page. I
added to my home directory then run the command mentioned on the
GitHub page:

<!-- cSpell:ignore dpkg,pscale -->

```bash
sudo dpkg -i pscale_0.107.0_linux_amd64.deb
```

To get the file from my Windows downloads folder to my Linux home
folder I used the `explorer.exe` command in WSL and dropped it in
there:

```bash
cd ~
explorer.exe .
```

I followed the guide for setting up the database and skipped over the
NextJS specific parts as I've already got the project in SvelteKit.

## PlanetScale CLI commands

The bit's to take away here are, create a database with the
PlanetScale CLI:

```bash
pscale db create star-app --region eu-central
```

`star-app` is the name of the database and the region is the closest
one to me here in the UK `eu-central`.

At the time of writing the available `--region`'s are:

```text
AWS us-east-1 (Northern Virginia) - us-east
AWS us-west-2 (Oregon) - us-west
AWS eu-west-1 (Dublin) - eu-west
AWS ap-south-1 (Mumbai) - ap-south
AWS ap-southeast-1 (Singapore) - ap-southeast
AWS ap-northeast-1 (Tokyo) - ap-northeast
AWS eu-central-1 (Frankfurt) - eu-central
AWS ap-southeast-2 (Sydney) - aws-ap-southeast-2
AWS sa-east-1 (Sao Paulo) - aws-sa-east-1
```

Create a branch from the `main` branch to add the database changes to:

```bash
pscale branch create star-app initial-setup
```

## Prisma schema config

As I mentioned earlier I already have an example project ready to go
the one thing I needed to do was to update the Prisma schema file
located in the root of the project (`prisma/schema.prisma`).

This can be initialized with this `npx` command `npx prisma init`,
what you get is something like this:

```graphql
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

I needed to change `"postgresql"` to `"mysql"` and add in some
additional items to the client and database (`db`):

```graphql
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["referentialIntegrity"]
}

datasource db {
  provider             = "mysql"
  url                  = env("DATABASE_URL")
  referentialIntegrity = "prisma"
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @default(now())
}
```

I've added the `User` model here that's part of the SvelteKit project.

Now I'll need add the local database connection string to a `.env`
file:

```bash
DATABASE_URL='mysql://root@127.0.0.1:3309/star-app'
```

That's local host on my machine `127.0.0.1` running on port `3309`
with the database name `star-app`.

I can then use the PlanetScale CLI to proxy into the PlanetScale
database:

```bash
pscale connect star-app initial-setup --port 3309
```

Now that I've got the database schema set up I can push these changes:

```bash
npx prisma db push
```

Because PlanetScale looks after all your changes there's no need for
`prisma migrate`.

I can add data locally with either the PlanetScale CLI or Prisma
studio:

```bash
npx prisma studio
```

That's it! My schema is now on PlanetScale ready to go into the main
branch. I followed the guide to
[Create a deploy request](https://docs.planetscale.com/tutorials/prisma-quickstart#create-a-deploy-request)
from the PlanetScale guide.

## Happy with PlanetScale

Overall I was super impressed with PlanetScale, I did spend the next
couple of hours working through various issues with deployment after
that though. More on that next!

<Tweet tweetLink="spences10/status/1543344326566154242" />

## Issues deploying

Ok so, this is where I spent the next few hours trying to work out why
Vercel was giving me build errors.

So the first issue was because I was using `bcrypt` which causes a
Vercel build error like this:

```text
[vite-plugin-svelte-kit] Build failed with 3 errors:
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:43:28: ERROR: Could not resolve "mock-aws-s3"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:76:22: ERROR: Could not resolve "aws-sdk"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:112:23: ERROR: Could not resolve "nock"
> Build failed with 3 errors:
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:43:28: ERROR: Could not resolve "mock-aws-s3"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:76:22: ERROR: Could not resolve "aws-sdk"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:112:23: ERROR: Could not resolve "nock"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:43:28: ERROR: Could not resolve "mock-aws-s3"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:76:22: ERROR: Could not resolve "aws-sdk"
node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:112:23: ERROR: Could not resolve "nock"
```

Not much in there to tell you that it's `bcrypt` but I found a
[StackOverflow question] which mentioned it.

Switching out `bcrypt` with `bcryptjs` solved that part.

The next was a post install warning for `@prisma/client` the error
looked like this:

```text
.../node_modules/@prisma/client postinstall: warning In order to use "@prisma/client", please install Prisma CLI. You can install it with "npm add -D prisma".
```

So after digging around the Prisma examples I added a `postinstall`
script and a `prisma:generate` to the `package.json`:

```json
"scripts": {
  "vercel-build": "prisma generate && svelte-kit build",
  "prisma:generate": "prisma generate"
}
```

That built the project but looking at the preview shows that the
serverless function has crashed:

> This Serverless Function has crashed.

> Your connection is working correctly.

> Vercel is working correctly.

500: INTERNAL_SERVER_ERROR

Code: FUNCTION_INVOCATION_FAILED

So, it was at that point I sent the tweet mentioned earlier and I had
[@josefaidt] come to the rescue with his blog post!

## Scripts

So this is the secret sauce that got it working! These two scripts
were what cleared it all up! This is what was in the post [Josef
shared].

```json
"scripts": {
  "vercel-postbuild": "cp node_modules/@prisma/engines/*query* .vercel_build_output/functions/node/render/;cp prisma/schema.prisma .vercel_build_output/functions/node/render/",
  "vercel-build": "prisma generate && pnpm build && pnpm vercel-postbuild"
}
```

I replaced the `vercel-build` and `prisma:generate` scripts I was
using with these two and the project built with no issues! 🥳

<!-- cSpell:ignore mikenikles -->

Massive thanks to [@josefaidt] for bringing this to may attention,
which he in turn got from [@mikenikles], [sveltekit-prisma] example 🙌

Massive thanks to both for this!

## References

There's been a lot of references mentioned, I've gathered them all up
here if not mentioned already:

- https://joyofcode.xyz/sveltekit-authentication-using-cookies
- https://josef.dev/posts/svelte-kit-planetscale-and-prisma-on-vercel
- https://flaviocopes.com/prisma-fix-initialize-yet-vercel/
- https://stackoverflow.com/q/70097108/1138354
- https://vercel.com/support/articles/why-does-my-serverless-function-work-locally-but-not-when-deployed
- https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1
- https://docs.planetscale.com/tutorials/prisma-quickstart
- https://docs.planetscale.com/tutorials/deploy-to-vercel#deploy-to-vercel

## Conclusion

I really like PlanetScale and Prisma! Two great tools to get you a
database up and running super fast!

With Vercel this is the first time I have had an issue like this, and
although the first set of error messages weren't indicating that it
was `bcrypt` I know for the future.

<!-- Links -->

[awesome guide]:
  https://joyofcode.xyz/sveltekit-authentication-using-cookies
[matia]: https://twitter.com/joyofcodedev
[video playlist]:
  https://www.youtube.com/playlist?list=PLA9WiRZ-IS_zKrDzhOhV5RGKKTHNIyTDO
[how to set up a free postgresql database on heroku]:
  https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1
[planetscale]: https://planetscale.com
[prisma with planetscale quickstart]:
  https://docs.planetscale.com/tutorials/prisma-quickstart
[@josefaidt]: https://twitter.com/josefaidt
[sveltekit-prisma]:
  https://github.com/mikenikles/sveltekit-prisma/blob/main/package.json#L13
[@mikenikles]: https://twitter.com/mikenikles
[stackoverflow question]: https://stackoverflow.com/q/70097108/1138354
[josef shared]:
  https://josef.dev/posts/svelte-kit-planetscale-and-prisma-on-vercel
