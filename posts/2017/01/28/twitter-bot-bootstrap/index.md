---
date: 2017-01-28
title: Easily set up your own Twitter bot
tags: ['guide']
isisPrivate: false
---

Want to get set up with your very own Twitter bot quickly and easily,
with this guide you can be set up in under 30 minutes. But first, why
should you want to build a Twitter bot?

There are some really useful Twitter bots out there that do some
pretty cool stuff they don't all spam current hashtags and follow
users relentlessly.

![rust bird]

Take the [Twisst ISS alerts] bot that sends you a DM when the
international space station (ISS) will be visible at your location.

Or there's public service bots like the [Earthquake Robot] that tweets
about any earthquake greater than 5.0 on the Richter Scale as they
happen.

There's [GoogleFacts] which tweets facts from Google, just remember to
fact check these facts on, err, Google?

And of course a robot that tweets poetry, [poem.exe] along with one
that will retweet your tweets that also happen to be an [Accidental
Haiku]

Bots can be used for many purposes in my case I have used it to
enhance my [@spences10] account by liking and re-tweeting subjects I
have an interest in, in the case of the [#100DaysOfCode] community
challenge there is a community bot which congratulates you on
[starting #100DaysOfCode] and again on completing it, these are
specific responses to tweets with keywords for a community, there is
also sentiment detection used under the [#100DaysOfCode] community
hashtag where the bot will tweet you with encouraging words if you
post a tweet with negative sentiment.

![100 days of code tweet]

One question I'm asked in job interviews quite often is "what do you
get out of working with technology?". My answer, "I like to automate
stuff, repetitive tasks to save me time so I can concentrate on other
stuff, I like the fact I have saved myself some time"

In the case of my @spences10 bot it's usually an opener for a
conversation with another user that follows me, so the bot can
initiate the conversation and I can carry on from where the bot left
off.

Bearing this in mind the bot is only as good as the person that has
programmed it, whilst researching this post I found a really good
resource for bots in general, [botwiki.org] has a bot ethics section:

> - Please don't make annoying bots
>   - An annoying bot mentions or follows people who didn't ask for it
>   - Posts common or trending hashtags
> - Please don't make abusive or harassing robots

So, ready to get started?

Ok, let's do this!!

---

## Twitter bot bootstrap

This is a bootstrap for setting up a Twitter bot with Node.js using
the `twit` library, the bot will like and re-tweet what you specify
when configuring it, it will also reply to followers with a selection
of canned responses.

As a primer for this there are the great posts by [@amanhimself] on
making your own twitter bot and this is an expansion on that with
further detail on configuration on Heroku

## What you'll need

- Twitter account [Duh!]
- Development environment with Node.js and NPM
  - c9 account
  - Node.js
  - NPM
- Heroku account

## Setup twitter

Set up an application on the Twitter account you want to favorite and
retweet from via: [https://apps.twitter.com/app/new]

As an example I'll configure the old [@DroidScott] twitter account I
have so you can follow along.

Straight forward enough for the twitter application, just make sure
you add your phone number to your Twitter account before clicking the
**Create your Twitter application** button.

![twitter application setup]

You should now be in the 'Application Management' section where you
will need to take a note of your keys, you should have your 'Consumer
Key (API Key)' and 'Consumer Secret (API Secret)' already available.

You'll need to scroll to the bottom of the page and click the **Create
my access token** to get the 'Access Token' and 'Access Token Secret'
take note of all four of them you'll need them when setting up the
bot.

## Setup development environment

For this I'm just going to say use [Cloud9] as you can be up and
running in minutes with one of the pre made Node.js environments.

![cloud 9 node env]

## Set up the bot

In the project tree delete the example project files of `client`,
`package.json`, `README.md` and `server.js` you'll not need them, you
can leve them there if you desire.

In your new Node.js c9 environment go to the terminal and enter:

```
$ git clone https://github.com/spences10/twitter-bot-bootstrap
```

## Project structure

The environment project tree should look something like this.

![project structure]

## Node dependencies

Before configuring the bot we'll need to install some dependencies,
from the terminal enter:

```
$ npm install --save twit
$ npm install --save unique-random-array
```

Then cd into your new folder `cd tw*` will move you to
`:~/workspace/twitter-bot-bootstrap (master) $` form here you can
configure the bot, from the terminal enter.

```
$ npm init
```

This will configure the `package.json` file with your details as
desired, just keep hitting return if you're happy with the defaults.

Onto the Twitter keys, now you'll need to add these to the `config.js`
file and you can then add some keywords into the `strings.js` file for
what you want to search on.

![c9 strings config]

Then add the username of the Twitter account you are using to the
`tweetNow` function in the `bot.js` file, this will ensure your bot
doesn't reply to itself when it has been followed by a user.

![c9 strings config1]

This step isn't strictly necessary if this account isn’t going to be
following any users.

That should be it, go to the terminal and enter `npm start` you should
get some output:

![bot output]

Check the Twitter account:

![twitter account]

## Heroku

Cool, now we have a bot that we can test on our dev environment but we
can't leave it there, we'll need to deploy it to Heroku.

If you haven't done so already set up a [Heroku account] then select
**Create a new app** from the dropdown box top right of your
dashboard, in the next screen name the app it if you want, then click
**Create App**.

![heroku create new app]

You'll be presented with your app dashboard and instructions for the
deployment method.

![heroku deploy]

Your app name should be displayed on the top of your dashboard, you'll
need this when logging in with the Heroku CLI.

![heroku app name]

## Heroku CLI

We're going to deploy initially via the Heroku Command Line Interface
_CLI_

From your c9 environment terminal, log into Heroku [it should be
installed by default]

```
$ heroku login
```

Enter your credentials.

```
$ cd twitter-bot-bootstrap
$ git init
$ heroku git:remote -a your-heroku-app-name
```

Deploy your application.

```
$ git add .
$ git commit -am 'make it better'
$ git push heroku master
```

You should get build output on the terminal.

![heroku build]

Then check the output with.

```
$ heroku logs -t
```

All good? Cool! :sunglasses:

## Heroku variables

Now that we have our bot on Heroku we can use environment variables to
store our Twitter keys so that if in the future we want to add our
code to GitHub we don't have to exclude the `config.js` file or add
our keys publicly.

If you take a look at the `config.js` file of this project you'll see
there's several lines commented output:

```
module.exports = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};
```

All you need to do is go to the console of your Heroku app and select
the 'Settings' sections and add in your Twitter keys, click the
'Reveal Config Vars' button and add in the variables with their
corresponding values.

```
CONSUMER_KEY
CONSUMER_SECRET
ACCESS_TOKEN
ACCESS_TOKEN_SECRET
```

Once you have the Heroku vars set up then you can un-comment the
`module.exports` section in the `config.js` file on your development
environment and you're ready to deploy to Heroku again without your
Twitter keys.

Your console commands should look something like this:

```
$ git add .
$ git commit -m 'add environment variables'
$ git push heroku master
```

Then you can check the Heroku logs again with.

```
$ heroku logs -t
```

You should now have a bot you can leave to do its thing forever more,
or until you decide you want to change the search criteria :smile:

## Heroku deployment via GitHub

You can also deploy your app by connecting to GitHub and deploy
automatically to Heroku each time your master branch is updated on
GitHub, this is straight forward enough.

Go to the ‘Deploy’ dashboard on Heroku, select GitHub as the
deployment method if you have connected your GitHub account to your
Heroku account then you can search for the repository so if you forked
this repo then you can just enter `twitter-bot-bootstrap` and
**Search** you can then click the **Connect** button, you can then
auto deploy from GitHub.

![heroku connect github]

## Heroku troubleshooting

What do you mean it crashed!?

![heroku crash]

Ok, I found that sometimes the `worker` is set as `web` and it crashes
out, try setting the `worker` again with:

```
$ heroku ps:scale worker=0
$ heroku ps:scale worker=1
```

Other useful Heroku commands I use:

```
$ heroku restart
```

By default you can only push your master branch if you are working on
a development branch i.e. `dev` branch and you want to test on Heroku
then you can use:

```
$ git push heroku dev:master
```

---

## Contributing

Please fork this repository and contribute back using pull requests.

Any contributions, large or small, major features, bugfixes and
integration tests are welcomed and appreciated but will be thoroughly
reviewed and discussed.

---

## Links

Credit for the inspiration for this should go to [@amanhimself] and
his posts on creating your own twitter bot.

- [create-a-simple-twitter-bot-with-node-js]
- [how-to-make-a-twitter-bot-with-nodejs]
- [twitter-mctwitbot]
- [awesome-twitter-bots]

Other posts detailing useful Twitter bots.

- [www.brit.co/twitter-bots-to-follow]
- [www.hongkiat.com/using-twitter-bots]

<!-- Links -->

[twisst iss alerts]: https://twitter.com/twisst
[earthquake robot]: https://twitter.com/earthquakeBot
[googlefacts]: https://twitter.com/GoogleFacts
[poem.exe]: https://twitter.com/poem_exe
[accidental haiku]: https://twitter.com/accidental575
[@spences10]: https://twitter.com/spences10
[#100daysofcode]:
  https://www.freecodecamp.org/news/start-2017-with-the-100daysofcode-improved-and-updated-18ce604b237b/
[starting #100daysofcode]:
  https://twitter.com/hashtag/100DaysOfCode?src=hash
[botwiki.org]: https://botwiki.org/bot-ethics
[@amanhimself]: https://twitter.com/amanhimself
[https://apps.twitter.com/app/new]: https://apps.twitter.com/app/new
[@droidscott]: https://twitter.com/droidscott
[cloud9]: https://c9.io/
[heroku account]: https://signup.heroku.com
[create-a-simple-twitter-bot-with-node-js]:
  https://hackernoon.com/create-a-simple-twitter-bot-with-node-js-5b14eb006c08#.flysreo60
[how-to-make-a-twitter-bot-with-nodejs]:
  https://chatbotslife.com/how-to-make-a-twitter-bot-with-nodejs-d5cb04fdbf97#.h5ah8dq5n
[twitter-mctwitbot]:
  https://medium.com/@spences10/twitter-mctwitbot-4d15cd005dc0#.dp9q5f427
[awesome-twitter-bots]:
  https://github.com/amandeepmittal/awesome-twitter-bots
[www.brit.co/twitter-bots-to-follow]:
  http://www.brit.co/twitter-bots-to-follow/
[www.hongkiat.com/using-twitter-bots]:
  http://www.hongkiat.com/blog/using-twitter-bots/

<!-- Images -->

[rust bird]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/rust-bird.jpg
[100 days of code tweet]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/100daysofcodetweet.png
[twitter application setup]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/twitter-application-setup.png
[cloud 9 node env]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/c9-node-env.png
[project structure]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/project-structure.png
[c9 strings config]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/c9-strings-config.png
[c9 strings config1]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/c9-strings-config1.png
[bot output]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/bot-output.png
[twitter account]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/twitter-account.png
[heroku create new app]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-create-new-app.png
[heroku deploy]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-deploy.png
[heroku app name]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-app-name.png
[heroku build]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-build.png
[heroku connect github]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-connect-github.png
[heroku crash]:
  https://now-images-wine.now.sh/2017/twitter-bot-bootstrap/heroku-crash.png
