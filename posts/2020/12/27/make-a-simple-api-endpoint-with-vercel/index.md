---
date: 2020-12-27
title: Make a Simple API Endpoint with Vercel Serverless Functions
tags: ['api', 'vercel', 'guide']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Create a simple Node API on Vercel Serverless functions in under 20
minutes. But first some preamble!

A while back (3 years ago now!) I made a [Positivity API], it was a
really simple array of positive quotes that's used in the
[#100DaysOfCode twitter bot] which is [still in use today]! I
contributed a lot to that bot [back in the day]!

This time around I've made some random words that are going to be used
to make blog a name!

## Tl;Dr

If you prefer to watch how this is done then skip all the way to the
end for a [video detailing the process](#video-detailing-the-process).
🚀

## Why are you doing this?

There are some people that do not like the term blog, and I too feel
the same way with regards to it being like a publishing house, this is
my space where I write stuff for future me. If it helps anyone else
then that's a win too!

I'm currently in the middle of rebuilding this site and the question
came up, what do I call it? [A digital garden]? I'm all for this
movement but there are also a lot more people that have no idea what
the term is.

I was discussing it with a couple of friends ([Paul] and [Rich]) and
it's _just_ a name, so I came up with the idea of generating some
random words together to make what to call the blog/site/thought
pamphlet whatever!

## In the beginning it was a simple site

First up, this was a collection of words I got from Googling [another
word for blog], put them all into several arrays of adjectives, verbs
and nouns then randomly create a phrase from that. Initially this was
all in a `.js` file on [a simple project] I put together quickly to
have a little fun with. It's now going to be a submission for the
Gatsby silly site challenge.

I decided that I wanted to have this in my personal site as well so
when someone navigates to the posts they'll be presented with a random
response from the script saying "hey welcome to my
`jot unsightly helpless record`" or something to that effect!

Becuse I wanted to use the same thing in two projects I made a third
one! 😂 An endpoint to go get that from rather than moving around the
script from project to project.

It's the simple script from that project that is now an endpoint on
Vercel. Hitting the URL https://random-blog-name.vercel.app/api will
give you a response like this:

```json
{
  "name": "script fierce magnificent datebook",
  "slug": "script-fierce-magnificent-datebook"
}
```

## Set up

Install Vercel as a global dependency with your package manager of
choice if you don't already have it installed:

```bash
yarn global add vercel
# or use vc login
vercel login
```

Once you select login you will be sent an email to authenticate then
you're ready to go!

## Create project

I'm going to recreate the random password generator I use in my
[Characters from Password] project I did a while back, it has the same
list of adjectives, verbs and nouns I used for the [Random Blog Name]
project.

```bash
mkdir random-password-generator
cd random-passord-generator
yarn init -y
```

Add Vercel as a dev dependency, I'll be using this to run the Vercel
dev server:

```bash
yarn add -D vercel
```

Add the Vercel scripts to the `package.json` scripts for the project!

```json
"scripts": {
  "start": "vercel dev",
  "deploy": "vercel deploy --prod"
},
```

Now to create the endpoint this goes into the api folder on the
project which doesn't exist yet, so, I'll make that, then create an
`index.ts` file in there:

```bash
mkdir api
touch -p api/index.ts
```

In the `api/index.ts` file add in the classic "hello world"!

```ts
import { NowRequest, NowResponse } from '@vercel/node'

export default (req: NowRequest, res: NowResponse) => {
  return res.json({ message: 'Hello World' })
}
```

Ready to go now, I'll run it locally with:

```bash
yarn start
```

This will walk me through a first time setup with Vercel and I'll hit
enter to accept all the default CLI options.

Now I go to `localhost:3000/api` in my browser and see:

```json
{ "message": "Hello World" }
```

Cool, cool, cool! Now I'll jack the `helper.js` file from my
Characters from Password project and add it to a
`src/random-password.ts` file and folder, neither of which exist right
now so create those:

```bash
# assuming your in the project directory
mkdir src
touch src/random-password.ts
```

Paste in the contents and add the type of `arr` as and array of
strings `arr: string[]`, I've removed the rest of the words for
brevity here:

```ts
export function random(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getFunPassword() {
  const adjectives = [
    'adorable',
    // rest
  ]

  const verbs = [
    'correct',
    //  rest
  ]

  const nouns = [
    'women',
    // rest
  ]

  return `${random(verbs)} ${random(adjectives)} ${random(
    adjectives
  )} ${random(nouns)}`
}
```

Then import the function into the `api/index.ts` file and have the
response json be the `getFunPassword()` function.

```ts
import { NowRequest, NowResponse } from '@vercel/node'
import { getFunPassword } from '../src/random-password'

export default (_req: NowRequest, res: NowResponse) => {
  return res.json({ password: getFunPassword() })
}
```

## Test it locally

The `yarn start` script should still be running so I can check the
response now on `localhost:3000/api`, looks a bit like this:

```json
{ "password": "know obnoxious bewildered people" }
```

Super! Time to deploy it!

## Deploy to Vercel

Righty ho! Time to deploy to Vercel! The script is already in the
project when I defined the start and deploy scripts:

```bash
yarn deploy
```

This will publish the current version of the code to Vercel, if you
want more control over how you publish to vercel check out the CLI
documentation, it's a really powerful tool.

Ok I now have an endpoint for a random password, going to
https://random-password-generator-ten.vercel.app/api will give a
response like this:

```json
{ "password": "try magnificent mysterious cacti" }
```

Time to use it!

## Use it in another project

Time to use it in another project, for brevity I've added this to an
[example CodeSandbox] it's a example of getting data from an endpoint
and displaying it in a project.

I'm using axios to get the data, and storing the returned result in
some state:

```jsx
export default function Home() {
  const [blogNameObj, blogNameObjSet] = useState({
    name: `Your password`,
  })
  const getBlogName = async () => {
    await axios
      .get(`https://random-password-generator-ten.vercel.app/api`)
      .then(res => {
        blogNameObjSet(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  return (
    <div>
      <h1>Generate Pasword</h1>
      <h2>{blogNameObj.password}</h2>
      <button
        onClick={() => {
          blogNameObjSet(getBlogName())
        }}
      >
        Get Name
      </button>
    </div>
  )
}
```

But it doesn't return anything, well apart from a console error!

```text
Error: Network Error
    at createError (https://...)

    at XMLHttpRequest.handleError (https://...)
```

So that's not a terribly helpful error message but I do know that it's
a [CORS] error, so that needs to be enabled before I go any further!

## Enable CORS

There's a great knowledge base resource on Vercel.com on [how to
enable CORS]! For my use case I've set the headers:

```ts
res.setHeader('Access-Control-Allow-Credentials', `true`)
res.setHeader('Access-Control-Allow-Origin', '*')
```

Now that's added I'll need to edploy it again with the `yarn deploy`
script.

Now going back to the CodeSandbox example it returns the API response!
Done!!

## Video detailing the process

As with most of my posts now I've added a video detailing the
process...

<YouTube youTubeId="xPLrHMGYpq4" />

## Code examples

There's [example code on GitHub] for the serverless function and an
[example CodeSandbox] with the implementation.

<!-- Links -->

[positivity api]: https://github.com/spences10/positivity-api
[still in use today]:
  https://github.com/freeCodeCamp/100DaysOfCode-twitter-bot/blob/master/package.json#L48
[#100daysofcode twitter bot]: https://twitter.com/_100DaysOfCode
[back in the day]:
  https://github.com/freeCodeCamp/100DaysOfCode-twitter-bot/graphs/contributors
[a digital garden]: https://scottspence.com/posts/a-digital-garden/
[paul]: https://twitter.com/PaulieScanlon
[rich]: https://twitter.com/studio_hungry
[random blog name]: https://github.com/spences10/random-blog-name
[another word for blog]:
  https://www.wordhippo.com/what-is/another-word-for/blog.html
[a simple project]:
  https://github.com/spences10/blog-name-generator/blob/bc39bf3b98/script.js
[characters from password]:
  https://github.com/spences10/characters-from-password
[example codesandbox]:
  https://codesandbox.io/s/zealous-lake-ep54i?file=/src/App.js
[example code on github]:
  https://github.com/spences10/random-password-generator
[cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[how to enable cors]: https://vercel.com/knowledge/how-to-enable-cors
