---
date: 2017-01-04
title: Twitter McTwitBot
tags: ['guide']
is_private: false
---

I must say this was great to do and a nice little introduction to node
and npm.

I got to doing this from finding it on [GitHub] I think I was looking
for the Twitter icon in bootstrap whilst working on my [Random Quote
Generator] I stumbled across the [twitter-bot-bootstrap] (as you do)
so after stalling with my progress on the freeCodeCamp(🔥) zipline for
a Wikipedia viewer I decided to give the Twitter bot a try and managed
to create it and add it to [Heroku] 🎉"

![twitter logo]

This app didn't work as well as expected though 😦, so I then decided
to take a look at [@amanhimself]'s Twitter bot he had created for the
[#100DaysOfCode] challenge, which I just happen to be taking part in.

So with his great documentation [here], [and here] I managed to cobble
together my own Twitter-bot which I use on my [@spences10] Twitter
account.

> If you're wondering about the post name [check here]

## Technologies used

Preamble out of the way, now I can walk through what was used.

### Cloud 9

I love this development environment, I soon became a fan of [c9] when
trying to install Ruby on my windows machine and then again after
installing Node.js on my computer for the first time.

### Node.js

I already had this installed on my c9 environment so I just had to
`npm install --save twit` then I was up and running

### Heroku

I didn't really get what Heroku was until I started this project but
once I'd read the guides it was quite straightforward and the [Heroku
CLI] was already installed on c9 I checked with `heroku --version`
before attempting to install it.

### GitHub

You can deploy straight from your c9 environment to Heroku and there
are loads of other integration tools you can use which I haven't had
time to look into yet. It's good practice to have your code on a
repository somewhere and GitHub is widely used.

### Twitter

You will need to set up a Twitter application from the [Twitter dev
portal]

---

All of the information above is in addition to the guides given by
[Aman] the stuff I'm going to go through now my experience with
deploying to Heroku, you may want to host the app somewhere different.

## My Approach

Use `node bot.js` to test locally, in [@amanhimself]'s example it will
tweet and favourite straight away then go on a timer.

Deploy to Heroku `git push heroku master`

This is after I have added the changes to Git with a commit message
and pushed the changes to my repo, here's the terminal commands:

```
$ git add .
$ git commit -m 'my detailed commit message'
$ git push origin master
$ git push heroku master
```

The final command will build the app on Heroku for you with output
like this:

![heroku-build]

> I know this isn't standard practice for GitHub and I am in the
> process of understanding how to branch and use Pull Requests so bear
> with me 😄

<!-- cSpell:ignore Procfile -->

The first gotcha for me was the Heroku `Procfile` I couldn't
understand why it kept timing out, this was because it was trying to
run the default `web` process instead of the `worker` process which is
what's needed for the bot.

After getting the bare bones set up on part 1 I then got to playing
around with the timings and the query strings used by the bot, this is
where things started to go a bit [off-piste]

![heroku-error-output]

For quite a while I couldn't understand why I was getting so many
errors, with a whole lot of `console.log(var)` throughout the code I
came to the conclusion that that the query string I was using:

```
var queryString = '#100DaysOfCode, #GitHub, #VSCode';
```

You can get the logs from Heroku when you app is running by typing:

```
$ heroku logs -t
```

This will give you your logs back from Heroku so you can add all the
debug lines you want in there to determine what's going on.

I was getting the errors pictured so I started to play with the query
string and just using one value at a time which didn't cause any
errors so I decided to pass one value at a time by adding the Gist
below.

<!-- cSpell:ignore daysofcode -->

```js
var queryList = [
  '100daysofcode',
  'freecodecamp',
  'github',
  'vscode',
  'node.js',
  'vue.js',
  'inferno.js',
]
var randomNumber = Math.floor(Math.random() * queryList.length)
var queryString = queryList[randomNumber]
```

This worked, for a while then the same errors started creeping in, I
then noticed that the `retweet` and `favouriteTweet` were on a timer
but using the same random text from the `queryString` which was about
as much use as the previous piece of code as it was a one time
initialisation [or initialization] so the same string was being used
multiple times causing the errors.

So after some head scratching and playing around with the code, [and
tweeting [@amanhimself] numerous times] Aman suggested that I use the
npm package [unique-random-array] to return a random string value from
the string list.

So I added the `var` in:

```
var uniqueRandomArray = require('unique-random-array');
```

Built the query string:

```js
var queryString = uniqueRandomArray([
  '100daysofcode',
  'freecodecamp',
  'github',
  'vscode',
  'visual studio code',
  'nodejs',
  'node.js',
  'vuejs',
  'vue.js',
  'inferno_js',
  'inferno.js',
  'jekyll',
])
```

Then just replaced the `queryString` string with the `queryString()`
method.

Some other things to note that I discovered when playing around with
the bot is the `retweet` and `favouriteTweet` function `params` was
the `result_type:` options, here's my comments copy pasted from the
Twitter dev portal:

```
// result_type: options, mixed, recent, popular
// * mixed : Include both popular and real time results in the response.
// * recent : return only the most recent results in the response
// * popular : return only the most popular results in the response.
```

The next stage for this could be to use the `unique-random-array`
package to change that value too.

That's it for now, I still have a weird bug where if I follow someone
and then someone else follows me the bot decides to tweet back to
itself!

![yes-tweet-yourself]

### Coming up

More stuff with the `.stream()` function, like auto follow back and
better replies.

<!-- Links -->

[github]: https://github.com
[random quote generator]: https://codepen.io/spences10/full/dOaYbP/
[twitter-bot-bootstrap]:
  https://github.com/mobeets/twitter-bot-bootstrap
[heroku]: https://heroku.com
[@amanhimself]: https://twitter.com/amanhimself
[#100daysofcode]:
  https://medium.freecodecamp.com/start-2017-with-the-100daysofcode-improved-and-updated-18ce604b237b
[here]:
  https://hackernoon.com/create-a-simple-twitter-bot-with-node-js-5b14eb006c08
[and here]:
  https://community.risingstack.com/how-to-make-a-twitter-bot-with-node-js/
[@spences10]: https://twitter.com/spences10
[check here]:
  https://en.wikipedia.org/wiki/RRS_Sir_David_Attenborough#Boaty_McBoatface_Naming_Controversy
[c9]: https://c9.io/?redirect=0
[heroku cli]: https://devcenter.heroku.com/articles/heroku-cli
[twitter dev portal]: https://apps.twitter.com/app/new
[aman]: https://github.com/amandeepmittal
[@amanhimself]: https://twitter.com/amanhimself
[off-piste]: https://en.oxforddictionaries.com/definition/us/off-piste
[unique-random-array]:
  https://www.npmjs.com/package/unique-random-array

<!-- Images -->

[twitter logo]:
  https://now-images-wine.now.sh/2017/twitter-mctwitbot/twitter-bird.png
[heroku-build]:
  https://now-images-wine.now.sh/2017/twitter-mctwitbot/heroku-build.png
[heroku-error-output]:
  https://now-images-wine.now.sh/2017/twitter-mctwitbot/heroku-error-output.png
[yes-tweet-yourself]:
  https://now-images-wine.now.sh/2017/twitter-mctwitbot/yes-tweet-yourself.png
