---
date: 2017-05-23
title: Twitter bot playground
tags: ['guide']
isPrivate: false
---

How to build and deploy a multifunctional Twitter bot!

This is a reference for me and anyone else that's interested in
Twitter bots in JavaScript.

All of the examples here use the [npm][npm] package [twit][twit].

We'll go through setting up a simple bot so each of these examples can
be run with it.

I'm going to assume that you have `nodejs` installed along with `npm`
and that you are comfortable with the terminal.

If you are not familiar node or do not have your environment set up to
use it take a look at the [README.md][twitter-bot-bootstrap-readme] on
my [Twitter bot bootstrap][twitter-bot-bootstrap] repo which details
getting a Twitter application set up and a development environment
with c9.

A great resource is [Aman Mittal's][aman-github-profile] [Awesome
Twitter bots][awesome-twitter-bots] repo which has resources and bot
examples.

A lot of this information is already out there I'm hoping this is all
the information someone will need to get started with their own
Twitter bot. I'm doing this for my own learning and hopefully other
people will get something out of this as well.

## Set up the bot

Before touching the terminal or writing any code we'll need to create
a [Twitter app][twitter-app] to get our API keys, we'll need them all:

```bash
Consumer Key (API Key)
Consumer Secret (API Secret)
Access Token
Access Token Secret
```

Keep the keys somewhere safe so you can use them again when you need
them, we're going to be using them in the [.env][dotenv] file we're
going to create.

We're using [dotenv][dotenv] so that if at some point in the future we
want to add our bot to GitHub the Twitter API keys are not added to
GitHub for all to see.

Starting from scratch, create a new folder via the terminal and
initialise the `package.json` via `npm` or `yarn` we'll need `twit`
and `dotenv` for all these examples.

I'll be using `yarn` for all these examples, you can use `npm` if you
prefer.

Terminal commands:

```bash
mkdir tweebot-play
cd tweebot-play
yarn init -y
yarn add twit dotenv
touch .env .gitignore index.js
```

If you take a look at the `package.json` that was created it should
look something like this:

```json
{
  "name": "tweebot-play",
  "version": "1.0.0",
  "main": "index.js",
  "author": "Scott Spence <spences10apps@gmail.com> (https://spences10.github.io/)",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^4.0.0",
    "twit": "^2.2.5"
  }
}
```

Add an `npm` script to the `package.json` to kick off the bot when
we're testing and looking for output:

```json
  "scripts": {
    "start": "node index.js"
  },
```

It should look something like this now:

```json
{
  "name": "tweebot-play",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "Scott Spence <spences10apps@gmail.com> (https://spences10.github.io/)",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^4.0.0",
    "twit": "^2.2.5"
  }
}
```

Now we can add the following pointer to the bot in `index.js`, like
so:

```js
require('./src/bot')
```

So when we use `yarn start` to run the bot it calls the `index.js`
file which runs the `bot.js` file from the `src` folder we're going to
create.

Now we add our API keys to the `.env` file, it should look something
like this:

```bash
CONSUMER_KEY=AmMSbxxxxxxxxxxNh4BcdMhxg
CONSUMER_SECRET=eQUfMrHbtlxxxxxxxxxxkFNNj1H107xxxxxxxxxx6CZH0fjymV
ACCESS_TOKEN=7xxxxx492-uEcacdl7HJxxxxxxxxxxecKpi90bFhdsGG2N7iII
ACCESS_TOKEN_SECRET=77vGPTt20xxxxxxxxxxxZAU8wxxxxxxxxxx0PhOo43cGO
```

In the `.gitignore` file we need to add `.env` and `node_modules`

```bash
# Dependency directories
node_modules

# env files
.env
```

Then init git:

```bash
git init
```

Ok, now we can start to configure the bot, we'll need a `src` folder a
`bot.js` file and a `config.js` file.

Terminal:

```bash
mkdir src
cd src
touch config.js bot.js
```

Then we can set up the bot config, open the `config.js` file and add
the following:

```js
require('dotenv').config()

module.exports = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
}
```

Ok, that's the bot config done now we can set up the bot, each of the
examples detailed here will have the same three lines of code:

```js
const Twit = require('twit')
const config = require('./config')

const bot = new Twit(config)
```

Ok, that's it out bot is ready to go, do a test with `yarn start` from
the terminal, we should get this for output:

```bash
yarn start
yarn start v0.23.4
$ node index.js
Done in 0.64s.
```

Bot is now configured and ready to go!🚀

## Post Statuses

Firstly post statuses, with `.post('statuses/update'...` bot will post
a hello world! status.

```js
bot.post(
  'statuses/update',
  {
    status: 'hello world!',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} tweeted!`)
    }
  }
)
```

## Work with users

To get a list of followers ids use `.get('followers/ids'...` and
include the account that you want the followers of, in this example
we're using [`@DroidScott`][scottbot], you can use any account you
like. We can then log them out to the console in this example.

```js
bot.get(
  'followers/ids',
  {
    screen_name: 'DroidScott',
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

You can specify with the `count` parameter how many results you get up
to 100 at a time.

Or to get a detailed list you can use `.get('followers/list'...`

Here we print off a list of `user.screen_name`'s up to 200 per call.

```js
bot.get(
  'followers/list',
  {
    screen_name: 'DroidScott',
    count: 200,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      data.users.forEach(user => {
        console.log(user.screen_name)
      })
    }
  }
)
```

To follow back a follower we can use `.post('friendships/create'...`
here the bot is following back the user `MarcGuberti`

> A bot should only follow users that follow the bot.

```js
bot.post(
  'friendships/create',
  {
    screen_name: 'MarcGuberti',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

Like with followers you can get a list of accounts that your bot is
following back.

```js
bot.get(
  'friends/ids',
  {
    screen_name: 'DroidScott',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

And also a detailed list.

```js
bot.get(
  'friends/list',
  {
    screen_name: 'DroidScott',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

Get friendship status, this is useful for following new followers,
this will give us the relation of a specific user. So you can run
through your followers list and follow back any users that do not have
the `following` connection.

Let's take a look at the relation between our bot and
[`@spences10`][scotttwit]

```js
bot.get(
  'friendships/lookup',
  {
    screen_name: 'spences10',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

If the user follows the bot, then relationship will be:

```bash
[ { name: 'Scott Spence 🌯😴💻♻',
    screen_name: 'spences10',
    id: 4897735439,
    id_str: '4897735439',
    connections: [ 'followed_by' ] } ]
```

If the user and the bot are following each other, the relationship
will be:

```bash
[ { name: 'Scott Spence 🌯😴💻♻',
    screen_name: 'spences10',
    id: 4897735439,
    id_str: '4897735439',
    connections: [ 'following', 'followed_by' ] } ]
```

And if there is no relationship then:

```bash
[ { name: 'Scott Spence 🌯😴💻♻',
    screen_name: 'spences10',
    id: 4897735439,
    id_str: '4897735439',
    connections: [ 'none' ] } ]
```

Direct Message a user with `bot.post('direct_messages/new'...`

> A bot should only DM a user that is following the bot account

```js
bot.post(
  'direct_messages/new',
  {
    screen_name: 'spences10',
    text: 'Hello from bot!',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

## Interact with tweets

To get a list of tweets in the bots time line use
`.get(statuses/home_timeline'...`

```js
bot.get(
  'statuses/home_timeline',
  {
    count: 1,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  }
)
```

To be more granular you can pull out specific information on each
tweet.

```js
bot.get(
  'statuses/home_timeline',
  {
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      data.forEach(t => {
        console.log(t.text)
        console.log(t.user.screen_name)
        console.log(t.id_str)
        console.log('\n')
      })
    }
  }
)
```

To retweet use `.post('statuses/retweet/:id'...` and pass in a tweet
id to retweet.

```js
bot.post(
  'statuses/retweet/:id',
  {
    id: '860828247944253440',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} retweet success!`)
    }
  }
)
```

To unretweet just use `.post('statuses/unretweet/:id'...`

```js
bot.post(
  'statuses/unretweet/:id',
  {
    id: '860828247944253440',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} unretweet success!`)
    }
  }
)
```

To like a tweet use `.post('favorites/create'...`

```js
bot.post(
  'favorites/create',
  {
    id: '860897020726435840',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} tweet liked!`)
    }
  }
)
```

To unlike a post use `.post('favorites/destroy'...`

```js
bot.post(
  'favorites/destroy',
  {
    id: '860897020726435840',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} tweet unliked!`)
    }
  }
)
```

To reply to a tweet is much the same a posting a tweet but you need to
include the `in_reply_to_status_id` parameter, but that's not enough
as you will also need to put in the screen name of the person you are
replying to.

```js
bot.post(
  'statuses/update',
  {
    status: '@spences10 I reply to you yes!',
    in_reply_to_status_id: '860900406381211649',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} tweeted!`)
    }
  }
)
```

Finally if you want to delete a tweet use
`.post('statuses/destroy/:id'...` passing the tweet id you want to
delete.

```js
bot.post(
  'statuses/destroy/:id',
  {
    id: '860900437993676801',
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${data.text} tweet deleted!`)
    }
  }
)
```

## Use Twitter search

To use search use `.get('search/tweets',...` there are quite a few
search parameters for search.

`q: ''` the Q is for query so to search for mango use `q: 'mango'` we
can also limit the results returned with `count: n` so let's limit it
the count to in the example:

```js
bot.get(
  'search/tweets',
  {
    q: 'mango',
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data.statuses)
    }
  }
)
```

Like we did with the timeline we will pull out specific items from the
`data.statuses` returned, like this:

```js
bot.get(
  'search/tweets',
  {
    q: 'mango',
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      data.statuses.forEach(s => {
        console.log(s.text)
        console.log(s.user.screen_name)
        console.log('\n')
      })
    }
  }
)
```

The search API returns for relevance and not completeness, if you want
to search for an exact phrase you'll need to wrap the query in quotes
`"purple pancakes"` if you want to search for one of two words then
use `OR` like `'tabs OR spaces'` if you want to search for both use
`AND` like `'tabs AND spaces'`.

If you want to search for a tweet without another word use `-` like
`donald -trump` you can use it multiple times as well, like
`donald -trump -duck`

You can search for tweets with emoticons, like `q: 'sad :('` try it!

Of course look for hashtags `q: '#towie'`. Look for tweets to a user
`q: 'to:@stephenfry'` or from a user `q: 'from:@stephenfry'`

You can filter out indecent tweets with the `filter:safe` parameter
you can also use it to filter for `media` tweets which will return
tweets containing video. You can specify for `images` to view tweets
with images and you can specify `links` for tweets with links.

If you want tweets from a certain website you can specify with the
`url` parameter like `url:asda`

```js
bot.get(
  'search/tweets',
  {
    q: 'from:@dan_abramov url:facebook filter:images since:2017-01-01',
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      data.statuses.forEach(s => {
        console.log(s.text)
        console.log(s.user.screen_name)
        console.log('\n')
      })
    }
  }
)
```

Last few now, there's the `result_type` parameter that will return
`recent`, `popular` or `mixed` results.

The `geocode` parameter that take the format latitude longitude then
radius in miles `'51.5033640,-0.1276250,1mi'` example:

```js
bot.get(
  'search/tweets',
  {
    q: 'bacon',
    geocode: '51.5033640,-0.1276250,1mi',
    count: 5,
  },
  (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      data.statuses.forEach(s => {
        console.log(s.text)
        console.log(s.user.screen_name)
        console.log('\n')
      })
    }
  }
)
```

## Use Twitter Stream API

There are two ways to use the Stream API first there's
`.stream('statuses/sample')` example:

```js
const stream = bot.stream('statuses/sample')

stream.on('tweet', t => {
  console.log(`${t.text}\n`)
})
```

This will give you a random sampling of tweets.

For more specific information use `.stream('statuses/filter')...` then
pass some parameters, use `track:` to specify a search string:

```js
var stream = bot.stream('statuses/filter', {
  track: 'bot',
})

stream.on('tweet', function (t) {
  console.log(t.text + '\n')
})
```

You can also use multiple words in the `track` parameter, tis will get
you results with either `twitter` or `bot` in them.

```js
const stream = bot.stream('statuses/filter', {
  track: 'twitter, bot',
})

stream.on('tweet', t => {
  console.log(`${t.text}\n`)
})
```

If you want both words then remove the comma `,` you can think of
spaces as `AND` and commas as `OR`

You can also use the `follow:` parameter which lets you input the ids
of specific users, example:

```js
const stream = bot.stream('statuses/filter', {
  follow: '4897735439',
})

stream.on('tweet', t => {
  console.log(`${t.text}\n`)
})
```

## Tweet media files

This [egghead.io][egghead-media-files] video is a great resource for
this section thanks to [Hannah Davis][hannah-davis] for the awesome
content!

This will be a request to get the [NASA image of the day][nasa-iotd]
and tweet it.

For this we will need references to `request` and `fs` for working
with the file system.

```js
const Twit = require('twit')
const request = require('request')
const fs = require('fs')
const config = require('./config')

const bot = new Twit(config)
```

First up get the photo from the NASA api, for this we will need to
create a parameter object inside our `getPhoto` function that will be
passed to the node HTTP client `request` for the image:

```js
function getPhoto() {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY,
    },
    encoding: 'binary',
  }
}
```

The `parameters` specify an `api_key` for this you can [apply for an
API key][api-apply] or you can use the `DEMO_KEY` this API key can be
used for initially exploring APIs prior to signing up, but it has much
lower rate limits, so you’re encouraged to signup for your own API
key.

In the example you can see that I have configured my key with the rest
of my `.env` variables.

```bash
CONSUMER_KEY=AmMSbxxxxxxxxxxNh4BcdMhxg
CONSUMER_SECRET=eQUfMrHbtlxxxxxxxxxxkFNNj1H107xxxxxxxxxx6CZH0fjymV
ACCESS_TOKEN=7xxxxx492-uEcacdl7HJxxxxxxxxxxecKpi90bFhdsGG2N7iII
ACCESS_TOKEN_SECRET=77vGPTt20xxxxxxxxxxxZAU8wxxxxxxxxxx0PhOo43cGO

NASA_KEY=DEMO_KEY
```

Now to use the `request` to get the image:

```js
function getPhoto() {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY,
    },
    encoding: 'binary',
  }
  request.get(parameters, (err, respone, body) => {
    body = JSON.parse(body)
    saveFile(body, 'nasa.jpg')
  })
}
```

In the `request` we pass in our parameters and parse the body as JOSN
so we can save it with the `saveFile` function which we'll go over
now:

```js
function saveFile(body, fileName) {
  const file = fs.createWriteStream(fileName)
  request(body)
    .pipe(file)
    .on('close', err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Media saved!')
        console.log(body)
      }
    })
}
```

`request(body).pipe(file).on('close'...` is what saves the file from
the `file` variable which has the name passed to it `nasa.jpg` from
the `getPhoto` function.

Calling `getPhoto()` should now save the NASA image of the day to the
root of your project.

Now we can share it on Twitter 😎

Two parts to this, first save the file.

```js
function saveFile(body, fileName) {
  const file = fs.createWriteStream(fileName)
  request(body)
    .pipe(file)
    .on('close', err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Media saved!')
        const descriptionText = body.title
        uploadMedia(descriptionText, fileName)
      }
    })
}
```

Then `uploadMedia` to upload media to Twitter before we can post it,
this had me stumped for a bit as I have my files in a `src` folder, if
you have your bot files nested in folders then you will need to do the
same if you are struggling with `file does not exist` errors:

Add a `require` to `path` then use `join` with the relevant relative
file path.

```js
const path = require('path')
//...
const filePath = path.join(__dirname, '../' + fileName)
```

Complete function here:

```js
function uploadMedia(descriptionText, fileName) {
  console.log(`uploadMedia: file PATH ${fileName}`)
  bot.postMediaChunked(
    {
      file_path: fileName,
    },
    (err, data, respone) => {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
        const params = {
          status: descriptionText,
          media_ids: data.media_id_string,
        }
        postStatus(params)
      }
    }
  )
}
```

Then with the `params` we created in `uploadMedia` we can post with a
straightforward `.post('statuses/update'...`

```js
function postStatus(params) {
  bot.post('statuses/update', params, (err, data, respone) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Status posted!')
    }
  })
}
```

Call the `getPhoto()` function top post to Twitter... super straight
forward, right 😀 no, I know it wasn't. Here's the complete module:

<details>
  <summary>Click to expand</summary>

```js
const Twit = require('twit')
const request = require('request')
const fs = require('fs')
const config = require('./config')
const path = require('path')

const bot = new Twit(config)

function getPhoto() {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY,
    },
    encoding: 'binary',
  }
  request.get(parameters, (err, respone, body) => {
    body = JSON.parse(body)
    saveFile(body, 'nasa.jpg')
  })
}

function saveFile(body, fileName) {
  const file = fs.createWriteStream(fileName)
  request(body)
    .pipe(file)
    .on('close', err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Media saved!')
        const descriptionText = body.title
        uploadMedia(descriptionText, fileName)
      }
    })
}

function uploadMedia(descriptionText, fileName) {
  const filePath = path.join(__dirname, `../${fileName}`)
  console.log(`file PATH ${filePath}`)
  bot.postMediaChunked(
    {
      file_path: filePath,
    },
    (err, data, respone) => {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
        const params = {
          status: descriptionText,
          media_ids: data.media_id_string,
        }
        postStatus(params)
      }
    }
  )
}

function postStatus(params) {
  bot.post('statuses/update', params, (err, data, respone) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Status posted!')
    }
  })
}

getPhoto()
```

</details>

## Make a Markov bot

This is pretty neat, again from the [egghead.io][egghead-markov]
series it uses [rita][rita-npm] natural language toolkit. It also uses
`csv-parse` as we're going to be reading out our Twitter archive to
make the bot sound like us tweeting.

First of all, to set up the [Twitter archive][tweet-archive], you'll
need to request your data from the Twitter settings page. You'll be
emailed a link to download your archive, then when you have downloaded
the archive extract out the `tweets.csv` file, we'll then put that in
it's own folder, so from the root of your project:

```bash
cd src
mkdir twitter-archive
```

We'll move our `tweets.csv` there to be accessed by the bot we're
going to go over now.

Use `fs` to set up a read stream...

```js
const filePath = path.join(__dirname, './twitter-archive/tweets.csv')

const tweetData = fs
  .createReadStream(filePath)
  .pipe(
    csvparse({
      delimiter: ',',
    })
  )
  .on('data', row => {
    console.log(row[5])
  })
```

When you run this from the console you should get the output from your
Twitter archive.

Now clear out things like `@` and `RT` to help with the natural
language processing we'll set up two functions `cleanText` and
`hasNoStopWords`

`cleanText` will tokenize the text delimiting it on space `' '` filter
out the stop words then `.join(' ')` back together with a space and
`.trim()` any whitespace that may be at the start of the text.

```js
function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
    .filter(hasNoStopWords)
    .join(' ')
    .trim()
}
```

The tokenized text can then be fed into the `hasNoStopWords` function
to be sanitized for use in `tweetData`

```js
function hasNoStopWords(token) {
  const stopwords = ['@', 'http', 'RT']
  return stopwords.every(sw => !token.includes(sw))
}
```

Now that we have the data cleaned we can tweet it, so replace
`console.log(row[5])` with
`inputText = inputText + ' ' + cleanText(row[5])` then we can use
`rita.RiMarkov(3)` the 3 being the number of words to take into
consideration. Then use `markov.generateSentences(1)` with 1 being the
number of sentences being generated. We'll also use `.toString()` and
`.substring(0, 140)` to truncate the result down to 140 characters.

```js
const tweetData =
  fs.createReadStream(filePath)
  .pipe(csvparse({
    delimiter: ','
  }))
  .on('data', function (row) {
    inputText = `${inputText} ${cleanText(row[5])}`
  })
  .on('end', function(){
    const markov = new rita.RiMarkov(3)
    markov.loadText(inputText)
    const sentence = markov.generateSentences(1)
      .toString()
      .substring(0, 140)
  }
```

Now we can tweet this with the bot using `.post('statuses/update'...`
passing in the `sentence` variable as the `status` logging out when
there is a tweet.

```js
const tweetData =
  fs.createReadStream(filePath)
    .pipe(csvparse({
      delimiter: ','
    }))
    .on('data', row => {
      inputText = `${inputText} ${cleanText(row[5])}`
    })
    .on('end', () => {
      const markov = new rita.RiMarkov(3)
      markov.loadText(inputText)
      const sentence = markov.generateSentences(1)
        .toString()
        .substring(0, 140)
      bot.post('statuses/update', {
        status: sentence
      }, (err, data, response) => {
        if (err) {
          console.log(err)
        } else {
          console.log('Markov status tweeted!', sentence)
        }
      })
    })
}
```

If you want your sentences to be closer to the input text you can
increase the words to consider in `rita.RiMarkov(6)` and if you want
to make it gibberish then lower the number.

Here's the completed module:

<details>
  <summary>Click to expand</summary>

```js
const Twit = require('twit')
const fs = require('fs')
const csvparse = require('csv-parse')
const rita = require('rita')
const config = require('./config')
const path = require('path')

let inputText = ''

const bot = new Twit(config)

const filePath = path.join(__dirname, '../twitter-archive/tweets.csv')

const tweetData =
  fs.createReadStream(filePath)
    .pipe(csvparse({
      delimiter: ','
    }))
    .on('data', row => {
      inputText = `${inputText} ${cleanText(row[5])}`
    })
    .on('end', () => {
      const markov = new rita.RiMarkov(10)
      markov.loadText(inputText)
      const sentence = markov.generateSentences(1)
        .toString()
        .substring(0, 140)
      bot.post('statuses/update', {
        status: sentence
      }, (err, data, response) => {
        if (err) {
          console.log(err)
        } else {
          console.log('Markov status tweeted!', sentence)
        }
      })
    })
}

function hasNoStopWords(token) {
  const stopwords = ['@', 'http', 'RT']
  return stopwords.every(sw => !token.includes(sw))
}

function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
    .filter(hasNoStopWords)
    .join(' ')
    .trim()
}
```

</details>

## Retrieve and Tweet data from Google sheets

If you want to tweet a list of links you can use
[`tabletop`][npm-tabletop] to work though the list, in this example
again from [egghead.io][egghead-tabletop] we'll go through a list of
links.

So, set up the bot and require `tabletop`:

```js
const Twit = require('twit')
const config = require('./config')
const Tabletop = require('tabletop')

const bot = new Twit(config)
```

On your [`Google spreadsheet`][google-sheets] you'll need to have a
header defined and then add your links, we'll use the following for an
example:

| links                        |
| ---------------------------- |
| https://www.freecodecamp.com |
| https://github.com           |
| https://www.reddit.com       |
| https://twitter.com          |

Now from Google sheets we can select 'File'>'Publish to the web' and
copy the link that is generated we can use that in table top.

Now init Table top with three parameters, `key:` which is the
spreadsheet URL, a `callback:` function to get the data and
`simpleSheet:` which is `true` if you only have one sheet, like in our
example here:

```js
const spreadsheetUrl =
  'https://docs.google.com/spreadsheets/d/1842GC9JS9qDWHc-9leZoEn9Q_-jcPUcuDvIqd_MMPZQ/pubhtml'

Tabletop.init({
  key: spreadsheetUrl,
  callback(data, tabletop) {
    console.log(data)
  },
  simpleSheet: true,
})
```

Running the bot now should give output like this:

```bash
$ node index.js
[ { 'links': 'https://www.freecodecamp.com' },
  { 'links': 'https://github.com' },
  { 'links': 'https://www.reddit.com' },
  { 'links': 'https://twitter.com' } ]
```

So now we can tweet them using `.post('statuses/update',...` with a
`forEach` on the `data` that is returned in the callback:

```js
Tabletop.init({
  key: spreadsheetUrl,
  callback(data, tabletop) {
    data.forEach(d => {
      const status = `${d.links} a link from a Google spreadsheet`
      bot.post(
        'statuses/update',
        {
          status,
        },
        (err, response, data) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Post success!')
          }
        }
      )
    })
  },
  simpleSheet: true,
})
```

Note that `${d.links}` is the header name we use in the Google
spreadsheet, I tried using skeleton and camel case and both returned
errors so I went with a single name header on the spreadsheet.

The completed code here:

<details>
  <summary>Click to expand</summary>

```js
const Twit = require('twit')
const config = require('./config')
const Tabletop = require('tabletop')

const bot = new Twit(config)

const spreadsheetUrl =
  'https://docs.google.com/spreadsheets/d/1842GC9JS9qDWHc-9leZoEn9Q_-jcPUcuDvIqd_MMPZQ/pubhtml'

Tabletop.init({
  key: spreadsheetUrl,
  callback(data, tabletop) {
    data.forEach(d => {
      const status = `${d.links} a link from a Google spreadsheet`
      console.log(status)
      bot.post(
        'statuses/update',
        {
          status,
        },
        (err, response, data) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Post success!')
          }
        }
      )
    })
  },
  simpleSheet: true,
})
```

</details>

## Putting it all together

Ok, so those examples were good n' all but we haven't really got a bot
out of this have we? I mean you run it from the terminal and that's it
done, we want to be able to kick off the bot and leave it to do its
thing.

One way I have found to do this is to use `setInterval` which will
kick off events from the main `bot.js` module, so let's try this:

Take the example we did to tweet a picture and add it to it's own
module, so from the root directory of our project:

```bash
cd src
touch picture-bot.js
```

Take the example code from that and paste it into the new module, then
we're going to make the following changes, to `getPhoto`:

```js
const getPhoto = () => {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY,
    },
    encoding: 'binary',
  }
  request.get(parameters, (err, respone, body) => {
    body = JSON.parse(body)
    saveFile(body, 'nasa.jpg')
  })
}
```

Then at the bottom of the module add:

```js
module.exports = getPhoto
```

So now we can call the `getPhoto` function from the `picture-bot.js`
module in our `bot.js` module, our `bot.js` module should look
something like this:

```js
const picture = require('./picture-bot')

picture()
```

That's it, two lines of code, try running that from the terminal now:

```bash
yarn start
```

We should get some output like this:

```bash
yarn start v0.23.4
$ node index.js
Media saved!
file PATH C:\Users\path\to\project\tweebot-play\nasa.jpg
{ media_id: 863020197799764000,
  media_id_string: '863020197799763968',
  size: 371664,
  expires_after_secs: 86400,
  image: { image_type: 'image/jpeg', w: 954, h: 944 } }
Status posted!
Done in 9.89s.
```

Ok, so thats the picture of the day done, but it has run once and
completed we need to put it on an interval with `setInterval` which we
need to pass two options to, the function it's going to call and the
timeout value.

The picture updates every 24 hours so that will be how many
milliseconds in 24 hours [8.64e+7] I don't even 🤷‍

I work it out like this, 1000 _ 60 = 1 minute, so 1000 _ 60 _ 60 _ 24
so for now let's add that directly into the `setInterval` function:

```js
const picture = require('./picture-bot')

picture()
setInterval(picture, 1000 * 60 * 60 * 24)
```

Cool, that's a bot that will post the NASA image of the day every 24
hours!

Let's keep going, now let's add some randomness in with the Markov
bot, like we did in the picture of the day example, let's create a new
module for the Markov bot and add all the code in there from the
previous example, so from the terminal:

```bash
cd src
touch markov-bot.js
```

Then copy pasta the markov bot example into the new module, then we're
going to make the following changes:

```js
const tweetData = () => {
  fs.createReadStream(filePath)
    .pipe(
      csvparse({
        delimiter: ',',
      })
    )
    .on('data', row => {
      inputText = `${inputText} ${cleanText(row[5])}`
    })
    .on('end', () => {
      const markov = new rita.RiMarkov(10)
      markov.loadText(inputText).toString().substring(0, 140)
      const sentence = markov.generateSentences(1)
      bot.post(
        'statuses/update',
        {
          status: sentence,
        },
        (err, data, response) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Markov status tweeted!', sentence)
          }
        }
      )
    })
}
```

Then at the bottom of the module add:

```js
module.exports = tweetData
```

Ok, same again as with the picture bot example we're going to add the
`tweetData` export from `markov-bot.js` to our `bot.js` module, which
should now look something like this:

```js
const picture = require('./picture-bot')
const markov = require('./markov-bot')

picture()
setInterval(picture, 1000 * 60 * 60 * 24)

markov()
```

Let's make the Markov bot tweet at random intervals between 5 minutes
and 3 hours

```js
const picture = require('./picture-bot')
const markov = require('./markov-bot')

picture()
setInterval(picture, 1000 * 60 * 60 * 24)

const markovInterval = (Math.floor(Math.random() * 180) + 1) * 1000
markov()
setInterval(markov, markovInterval)
```

Allrighty! Picture bot, Markov bot, done 👍

Do the same with the link bot? Ok, same as before, you get the idea
now, right?

Create a new file in the `src` folder for link bot:

```bash
touch link-bot.js
```

Copy pasta the code from the link bot example into the new module,
like this:

```js
const link = () => {
  Tabletop.init({
    key: spreadsheetUrl,
    callback(data, tabletop) {
      data.forEach(d => {
        const status = `${d.links} a link from a Google spreadsheet`
        console.log(status)
        bot.post(
          'statuses/update',
          {
            status,
          },
          (err, response, data) => {
            if (err) {
              console.log(err)
            } else {
              console.log('Post success!')
            }
          }
        )
      })
    },
    simpleSheet: true,
  })
}

module.exports = link
```

Then we can call it from the bot, so it should look something like
this:

```js
const picture = require('./picture-bot')
const markov = require('./markov-bot')
const link = require('./link-bot')

picture()
setInterval(picture, 1000 * 60 * 60 * 24)

const markovInterval = (Math.floor(Math.random() * 180) + 1) * 1000
markov()
setInterval(markov, markovInterval)

link()
setInterval(link, 1000 * 60 * 60 * 24)
```

Ok? Cool 👍😎

We can now leave the bot running to do its thing!!

## Deploy to now

Right, we have a bot that does a few things but it's on our
development environment, so it can't stay there forever, well it could
but it'd be pretty impcratcical. Let's put our bot on a server
somewhere to do it's thing.

To do this we're going to be using [now][now], `now` allows for simple
deployments from the CLI if you're not fimailiar with now then take a
quick look at the [documentation][now] in these examples we're going
to be using the `now-cli`.

There's a few things we need to do in order to get our bot ready to go
on [now][now], let's list them quickly and then go into detail.

- Signup and install now-cli
- Add now settings + .npmignore file
- Add .env variables as secrets
- Add npm deploy script
- Re jig picture-bot.js

Ready? Let's do this! 💪

**Signup and install now-cli**

Fist up let's signup for [zeit][zeit-login] ▲ create an account and
authenticate, then we can install the CLI.

Install `now` globally on our machine so you can use it everywhere, to
install the `now-cli` from the terminal enter:

```bash
npm install -g now
```

Once it's completed login with:

```bash
now --login
```

The first time you run `now`, it'll ask for your email address in
order to identify you. Go to the email account to supplied when
sigining up an click on the email sent to you from `now`, and you'll
be logged in automatically.

If you need to switch the account or re-authenticate, run the same
command again.

You can always check out the [now-cli][now-getting-started-cli]
documentation for more information along with the [your first
deployment][now-first-deploy] guide.

**Add now settings**

Ok, so that's signup and install sorted, we can now configure the bot
for deploying to `now`. First up let's add the `now` settings to our
`package.json` file, I've put it in between my `npm` scripts and the
author name in my `package.json`:

```json
"scripts": {
    "start": "node index.js"
  },
  "now": {
    "alias": "my-awesome-alias",
    "files": [
      "src",
      "index.js"
    ]
  },
  "author": "Scott Spence",
```

This was a source of major confusion for me so I'm hoping I can save
you the pain I went through trying to configure this, all the relevant
documentation is there you just need to put it all together 😎

> If you find anything in here that doesn't make sense or is just
> outright wrong then please [log an issue][github-issue] or create a
> pull request 👍

The now settings `alias` is to give your deployment a shothand name
over the auto generated URL that `now` creates, the `files` section
covers what we want to include in the depoloyment to `now` we'll go
over the file structure shortly. Basically what is included in the
`files` array is all that get pused up to the now servers.

All good so for?

Ok, now we need to add a `.npmignore` file in the root of the project
and add the following line to it:

```bash
!tweets.csv
```

The `tweets.csv` needs to go up to the `now` server to be used by the
bot, but we previously included it in our `.gitignore` which is what
`now` uses to build your project when it's being loaded to the server.
So this means that the file isn't going to get loaded unless we add
the `.npmignore` to not ignore the `tweets.csv` 😅

**Add .env variables as secrets**

Ok, our super duper secret Twitter keys will need to be stored as
`secrets` in `now` this is a pretty neat feature where you can define
anything as a secret and reference it as an alias with `now`.

Let's start, so the syntax is `now secrets add my-secret "my value"`
so for our `.env` keys add them all in giving them a descriptive [but
short!] name.

> You will not need to wrap your "my value" in quotes but the
> documentation does say "when in doubt, wrap your value in quotes"

Ok, so from the terminal `now secrets ls` should list out your
`secrets` you just created:

```bash
$ now secrets ls
> 5 secrets found under spences10 [1s]

                            id  name                   created
  sec_xxxxxxxxxxZpLDxxxxxxxxxx  ds-twit-key            23h ago
  sec_xxxxxxxxxxTE5Kxxxxxxxxxx  ds-twit-secret         23h ago
  sec_xxxxxxxxxxNorlxxxxxxxxxx  ds-twit-access         23h ago
  sec_xxxxxxxxxxMe1Cxxxxxxxxxx  ds-twit-access-secret  23h ago
  sec_xxxxxxxxxxMJ2jxxxxxxxxxx  nasa-key               23h ago
```

**Add npm deploy script**

Now we have our secrets defined we can create a deployment script to
deploy to `now`, so in our `package.json` let's add an additional
script:

```json
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "deploy": "now -e CONSUMER_KEY=@ds-twit-key
        -e CONSUMER_SECRET=@ds-twit-secret -e ACCESS_TOKEN=@ds-twit-access
        -e ACCESS_TOKEN_SECRET=@ds-twit-access-secret -e NASA_KEY=@nasa-key"
  },
  "now": {
```

Let's go over what we have added there, `deploy` will run the `now`
command and pass it all our environment `-e` variables and the
associated `secret` value, if we break it down into separate lines it
will be a bit clearer:

```bash
now
-e CONSUMER_KEY=@ds-twit-key
-e CONSUMER_SECRET=@ds-twit-secret
-e ACCESS_TOKEN=@ds-twit-access
-e ACCESS_TOKEN_SECRET=@ds-twit-access-secret
-e NASA_KEY=@nasa-key
```

**Re jig picture-bot.js**

Ok, because `now` deployments are [immutable][immutable-deployment] it
means that there's no write access to the disk where we want to save
our NASA photo of the day, so to get around that we need to use the
`/tmp` file location.

Shout out to [@Tim][tim] from `zeit` for helping me out with this!

In the `picture-bot.js` module add the following two lines to the top
of the module:

```js
const os = require('os')
const tmpDir = os.tmpdir()
```

Those two lines give us the `temp` directory of the operating system,
so if like me you're on Windows it will work as well as if you are on
another stsyem like a linux based system, which is what `now` is. In
our `saveFile` function we're going to use `tmpDir` to save our file.

We've taken out the `nasa.jpg` from the `getPhoto` function as we can
define that information in the `saveFile` function, the NASA potd is
not just a `'jpeg` some items posted there are videos as well. We we
can define the type with a [ternary function][ternary] off of the
`body` being passed in, this will send a tweet with a link to the
video:

```js
function saveFile(body) {
  const fileName =
    body.media_type === 'image/jpeg' ? 'nasa.jpg' : 'nasa.mp4'
  const filePath = path.join(tmpDir + `/${fileName}`)

  console.log(`saveFile: file PATH ${filePath}`)
  if (fileName === 'nasa.mp4') {
    // tweet the link
    const params = {
      status: 'NASA video link: ' + body.url,
    }
    postStatus(params)
    return
  }
  const file = fs.createWriteStream(filePath)

  request(body)
    .pipe(file)
    .on('close', err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Media saved!')
        const descriptionText = body.title
        uploadMedia(descriptionText, filePath)
      }
    })
}
```

The completed code here:

<details>
  <summary>Click to expand</summary>

```js
const Twit = require('twit')
const request = require('request')
const fs = require('fs')
const config = require('./config')
const path = require('path')

const bot = new Twit(config)

const os = require('os')
const tmpDir = os.tmpdir()

const getPhoto = () => {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY,
    },
    encoding: 'binary',
  }
  request.get(parameters, (err, respone, body) => {
    body = JSON.parse(body)
    saveFile(body)
  })
}

function saveFile(body) {
  const fileName =
    body.media_type === 'image/jpeg' ? 'nasa.jpg' : 'nasa.mp4'
  const filePath = path.join(tmpDir + `/${fileName}`)

  console.log(`saveFile: file PATH ${filePath}`)
  if (fileName === 'nasa.mp4') {
    // tweet the link
    const params = {
      status: 'NASA video link: ' + body.url,
    }
    postStatus(params)
    return
  }
  const file = fs.createWriteStream(filePath)

  request(body)
    .pipe(file)
    .on('close', err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Media saved!')
        const descriptionText = body.title
        uploadMedia(descriptionText, filePath)
      }
    })
}

function uploadMedia(descriptionText, fileName) {
  console.log(`uploadMedia: file PATH ${fileName}`)
  bot.postMediaChunked(
    {
      file_path: fileName,
    },
    (err, data, respone) => {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
        const params = {
          status: descriptionText,
          media_ids: data.media_id_string,
        }
        postStatus(params)
      }
    }
  )
}

function postStatus(params) {
  bot.post('statuses/update', params, (err, data, respone) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Status posted!')
    }
  })
}

module.exports = getPhoto
```

</details>

Ok, thats it! We're ready to deploy to `now`!🚀

So from the terminal we call our deployment script we defined earlier:

```bash
yarn deploy
```

You will get some output:

```bash
λ yarn deploy
yarn deploy v0.24.4
$ now -e CONSUMER_KEY=@ds-twit-key -e CONSUMER_SECRET=@ds-twit-secret
    -e ACCESS_TOKEN=@ds-twit-access  -e ACCESS_TOKEN_SECRET=@ds-twit-access-secret
    -e NASA_KEY=@nasa-key
> Deploying ~\gitrepos\tweebot-play under spences10
> Using Node.js 7.10.0 (default)
> Ready! https://twee-bot-play-rapjuiuddx.now.sh (copied to clipboard) [5s]
> Upload [====================] 100% 0.0s
> Sync complete (1.54kB) [2s]
> Initializing…
> Building
> ▲ npm install
> ⧗ Installing:
>  ‣ csv-parse@^1.2.0
>  ‣ dotenv@^4.0.0
>  ‣ rita@^1.1.63
>  ‣ tabletop@^1.5.2
>  ‣ twit@^2.2.5
> ✓ Installed 106 modules [3s]
> ▲ npm start
> > tweet-bot-playground@1.0.0 start /home/nowuser/src
> > node index.js
> saveFile: file PATH /tmp/nasa.jpg
> Media saved!
> uploadMedia: file PATH /tmp/nasa.jpg
```

Woot! You have your bot deployed! 🙌

If you click on the link produced you will be able to inspect the bot
as it is on `now` there's also a handy logs section on the page where
you can check for output. 👍

## Contributing

Please fork this repository and contribute back using pull requests.

Any contributions, large or small, major features, bug fixes and
integration tests are welcomed and appreciated but will be thoroughly
reviewed and discussed.

## License

MIT License

Copyright (c) 2017, Scott Spence. All rights reserved.

<!--links-->

[license-badge]:
  https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: http://opensource.org/licenses/MIT
[gitter-bagde]:
  https://badges.gitter.im/awesome-twitter-bots/Lobby.svg
[gitter-url]:
  https://gitter.im/awesome-twitter-bots/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[npm]: https://www.npmjs.com/
[twit]: https://www.npmjs.com/package/twit
[twitter-bot-bootstrap-readme]:
  https://github.com/spences10/twitter-bot-bootstrap#twitter-bot-bootstrap
[twitter-bot-bootstrap]:
  https://github.com/spences10/twitter-bot-bootstrap
[aman-github-profile]: https://github.com/amandeepmittal
[awesome-twitter-bots]:
  https://github.com/amandeepmittal/awesome-twitter-bots
[twitter-app]: https://apps.twitter.com/app/new
[dotenv]: https://www.npmjs.com/package/dotenv
[scottbot]: https://twitter.com/DroidScott
[scotttwit]: https://twitter.com/spences10
[egghead-media-files]:
  https://egghead.io/lessons/node-js-tweet-media-files-with-twit-js
[hannah-davis]: https://egghead.io/instructors/hannah-davis
[nasa-iotd]: https://www.nasa.gov/multimedia/imagegallery/iotd.html
[api-apply]: https://api.nasa.gov/index.html#apply-for-an-api-key
[egghead-markov]:
  https://egghead.io/lessons/node-js-make-a-bot-that-sounds-like-you-with-rita-js?series=create-your-own-twitter-bots
[rita-npm]: https://www.npmjs.com/package/rita
[tweet-archive]: https://support.twitter.com/articles/20170160
[npm-tabletop]: https://www.npmjs.com/package/tabletop
[egghead-tabletop]:
  https://egghead.io/lessons/node-js-retrieve-and-tweet-information-from-google-spreadsheets
[google-sheets]: sheets.google.com
[zeit-login]: https://zeit.co/login
[now]: https://zeit.co/now
[now-getting-started-cli]:
  https://zeit.co/docs/getting-started/installing-now#cli-with-npm
[now-first-deploy]:
  https://zeit.co/docs/getting-started/your-first-deployments#deploying-node
[github-issue]:
  https://github.com/spences10/twitter-bot-playground/issues/new
[immutable-deployment]:
  https://blog.codeship.com/immutable-deployments/
[tim]: https://github.com/timneutkens
[ternary]:
  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
