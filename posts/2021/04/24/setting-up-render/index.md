---
date: 2021-04-24
title: Setting up Resources on Render
tags: ['render', 'notes', 'resource']
isPrivate: false
---

Render is pretty neat!

I'm still super early days but I have discovered the `render.yml`
files that is the equivalent to the Amazon CDK (Cloud Development
Kit). The Amazon CDK is pretty powerful from what I can glean.

I say that because I have watched several videos on how awesome it is,
but my eyes always glaze over when I have to go on a six week training
course just so I know how many services Amazon can offer me! Bitter?
Maybe, confused? Absolutely.

<!-- cSpell:ignore ranty -->

I'm not going to get all ranty about AWS, all I'll say is that it's
not the sort of thing you can go 'quickly' spin something up without
worrying if you're going to end up with a massive bill at the end of
the month.

Preconceptions? Absolutely, and until there's an AWS light I don't
think they will change for me. There are services that offer the AWS
light option though, services like Vercel, Begin, Netlify functions
and Render.

## Render YML

<!-- cSpell:ignore psql -->

Render gives you the option to configure your whole stack in one file.
So far I've only spun up a Strapi web service with accompanying PSQL
databases for a staging and production environment.

```yml
services:
  - type: web
    name: strapi-production
    env: node
    plan: starter
    buildCommand: yarn install && yarn build
    startCommand: yarn start
    healthCheckPath: /_health
    region: frankfurt
    envVars:
      - key: NODE_VERSION
        value: 12.18.4
      - key: NODE_ENV
        value: production
      - key: CLOUDINARY_NAME
        sync: false
      - key: CLOUDINARY_KEY
        sync: false
      - key: CLOUDINARY_SECRET
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: database-production
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ADMIN_JWT_SECRET
        generateValue: true
  - type: web
    name: strapi-staging
    env: node
    plan: starter
    buildCommand: yarn install && yarn build
    startCommand: yarn start
    healthCheckPath: /_health
    region: frankfurt
    envVars:
      - key: NODE_VERSION
        value: 12.18.4
      - key: NODE_ENV
        value: production
      - key: CLOUDINARY_NAME
        sync: false
      - key: CLOUDINARY_KEY
        sync: false
      - key: CLOUDINARY_SECRET
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: database-staging
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ADMIN_JWT_SECRET
        generateValue: true

databases:
  - name: database-production
    plan: starter
    region: frankfurt
  - name: database-staging
    plan: starter
    region: frankfurt
```
