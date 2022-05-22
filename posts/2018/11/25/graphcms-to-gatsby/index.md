---
date: 2018-11-25
title: Get your GraphCMS data into Gatsby
tags:
  [
    'learning',
    'guide',
    'gatsby',
    'getting-started',
    'graphql',
    'graphcms',
  ]
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Let's set up Gatsby to pull data from GraphCMS.

<YouTube youTubeId="S9JeASI5tck" />

This will be a walk-through of setting up some basic data on the
headless CMS, GraphCMS and then querying that data in Gatsby.

## 1. Set up GraphCMS

Set yourself up with a GraphCMS account at
https://app.graphcms.com/signup and select the developer plan.

## 2. Define Data

Create a new project and add in some data to query.

Select the **Create new project** option, call it what you like, in
this example it's going to be a list of projects, so I'm calling it
_Project List_.

In the side bar select the Schema and create a model, in this case
**Project**. In the project model we're going to have a _Title_ and a
_Description_.

Select the fields from the tray on the right by clicking the
**FIELDS** tab and dragging and dropping them into the **Project**
model we created.

## 3. Configure the GraphCMS public API

In the GraphCMS settings set the **Public API Permissions** to
**READ** scroll down to **Endpoints** and copy the URL for use in
configuring Gatsby.

That's it for the CMS configuration, now to pull that data into our
Gatsby frontend!

## 4. Configure Gatsby

In you Gatsby project install `gatsby-source-graphql` and configure it
in `gatsby-config.js` the configuration should looks something like:

```js
{
  resolve: 'gatsby-source-graphql',
  options: {
    typeName: 'GRAPHCMS',
    fieldName: 'graphCmsData',
    url: 'https://api-euwest.graphcms.com/v1/projectid/master',
  }
},
```

In this example we're using [codesandbox.io] for our text editor and
the Gatsby Default Starter you get when selecting Gatsby from the
SERVER TEMPLATES available to you in [codesandbox.io]

## 5. Query the data in Gatsby GraphiQL

Now that the endpoint is set up we will be able to query the data with
Gatsby's GraphiQL UI, we can shape the query we want to use to display
the data here.

In the preview of our app in [codesandbox.io] if you add `___grapgql`
to the end of the url it will bring up the Gatsby GraphiQL UI, here we
can shape the data we want to query.

If we open up some curly brackets `{}` and Cmd+space we'll see the
available fields where we can pick out the `graphCmsData` field we
defined in the `gatsby-source-graphql` plugin.

Selecting the fields we created in GraphCMS then running the query
will display our defined data.

```js
{
  graphCmsData {
    projects {
      id
      status
      title
      description
    }
  }
}
```

## 6. Display the Data

Use the `graphql` gatsby export to query the data from the GraphCMS
endpoint.

In `pages/index.js` add the `graphql` export the the `gatsby` imports.

```js
import { graphql, Link } from 'gatsby'
```

At the very bottom define the query:

```js
export const query = graphql`
  {
    graphCmsData {
      projects {
        id
        status
        title
        description
      }
    }
  }
`
```

You will then be able to access the `data` prop in the `IndexPage`
component, we'll need to de-structure the `data` prop out in the
arguments of the component:

```js
const IndexPage = ({ data }) => (
```

Now we can access the `data` passed into the component, we just need a
way to visualise it! Luckily for use there's a handy component from
Wes Bos that we can use called [Dump], so create a new `dump.js`
component in `components` then import it into the `index.js` file, and
add in the component to see what's inside the props:

```js
const IndexPage = ({ data }) => (
  <Layout>
    <h1>Hi people</h1>
    <Dump data={data} />
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: '300px', marginBottom: '1.45rem' }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)
```

The output should be the same as the result of the Gatsby GraphiQL
query we created:

```json
data 💩{
 "graphCmsData": {
  "projects": [
   {
    "id": "cjoxa812txqoh0932hz0bs345",
    "status": "PUBLISHED",
    "title": "Project 1",
    "description": "Description 1"
   },
   {
    "id": "cjoxa8cctxqqj0932710u39db",
    "status": "PUBLISHED",
    "title": "Project 2",
    "description": "Description 2"
   },
   {
    "id": "cjoxa8pbqxqt309324z9bcddv",
    "status": "PUBLISHED",
    "title": "Project 3",
    "description": "Description 3"
   },
   {
    "id": "cjoxa959vxqvz0932g1jn5ss3",
    "status": "PUBLISHED",
    "title": "Project 4",
    "description": "Description 4"
   }
  ]
 }
}
```

[codesandbox.io]: https://codesandbox.io/dashboard/recent
[dump]: https://github.com/wesbos/dump
