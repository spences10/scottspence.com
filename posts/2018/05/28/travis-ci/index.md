---
date: 2018-05-28
title: Making a CI pipeline with Travis CI
tags: ['guide', 'ci-cd']
isPrivate: false
---

I thought I'd set up this blog with some sort of build pipeline, the
intention was to have a good Continuous Integration pipeline so that
if there were any issues when building the site that I wouldn't push a
broken build. No one wants to see that 😿

I'm feeling my way around with this and I'm presuming it's far from
perfect or ideal even, but I have it as a functional work-flow.

### What I'm using

- Zeit's now

- Gatsby

- Travis DUH!

### How the set-up works

I have my GitHub project set up with two branches `master` and
`development`, changes are made on feature branch of `development`
then pushed into `development` then up to `master` once I'm happy the
change is ok to go to production.

Using [Zeit's now] you can define a different url for each of your
environments. I have a `.now.sh` url for `development` and a
sub-domain of my `scottspence.me` domain for `master`/production.

### The set-up

There are a few parts to setting this up, the first is adding your
repository to https://travis-ci.org/ then adding your `NOW_TOKEN` from
https://zeit.co/account/tokens to the repository settings page on
Travis-ci

The [guide here] covers it for using now, the part I found
particularly painful was generating the secure variable for the
`.travis.yml` file because I don't have Ruby installed and I struggled
to set it up on my openSUSE WSL install, so instead I used a Cloud9
machine in the end.

#### the flow

Issue is "Add self hosted Fonts #75" I'll make a branch from git and
give it a name to reflect the issue number
`dev/75/add-self-hosted-fonts` I'll make my changes locally then push
to the `development` branch.

Once I have merged these changes into the `development` branch then I
can view them om the `.now.sh` url configured in my `package.json`

My `travis.yml` looks like this:

```yaml
sudo: false

language: node_js

cache:
  directories:
    - node_modules

notifications:
  email: false

node_js:
  - '9'

before_script:
  - npm prune

script:
  - npm i -g now@canary
  - npm run clean
  - npm run build
  - npm run deploy

after_script:
  - if [ "$TRAVIS_BRANCH" = "development" ]; then npm run alias:dev;
    fi
  - if [ "$TRAVIS_BRANCH" = "master" ]; then npm run alias:prod; fi
  - if [ "$TRAVIS_BRANCH" = "master" ]; then npm run release; fi
  - npm run cleanup

env:
global:
  secure: lngmfinghashvariable!
```

My `package.json` looks like this:

```json
  "now": {
    "name": "scottblog"
  },
  "scripts": {
    "clean": "rm -rf .cache/ && rm -rf scottblog/ && rm -rf public/",
    "build": "gatsby build && mv public scottblog",
    "deploy:now": "npm run clean && npm run build && now scottblog/",
    "dev": "npm run clean && gatsby develop",
    "format": "pretty-quick",
    "precommit": "pretty-quick --staged",
    "deploy": "now scottblog/ --token $NOW_TOKEN",
    "alias:dev": "now alias blog-scottspence.now.sh --token $NOW_TOKEN",
    "alias:prod": "now alias blog.scottspence.me --token $NOW_TOKEN",
    "cleanup": "now rm scottblog --safe --yes --token $NOW_TOKEN",
    "release": "release-it"
  },
```

[zeit's now]: https://zeit.co/now
[guide here]: https://zeit.co/docs/examples/travis
