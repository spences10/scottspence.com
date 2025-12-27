---
date: 2021-01-02
title: Get GraphQL Data Using Axios
tags: ['graphql', 'api', 'notes']
is_private: false
---

Ok this is a little snippet I've got set up to query data from the
GitHub GraphQL API.

I use this for getting data to work with in data visualisation tools,
I've done it a couple of times now with my Gatsby site but now I'm
attempting to do it in a serverless function.

Here's the snippet I'm using from [SO]:

```ts
import axios from 'axios'
import query from './query'

export async function getGitHubData() {
  const gitHubCall = await axios.post(
    `https://api.github.com/graphql`,
    {
      query,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token ' + process.env.GITHUB_TOKEN,
      },
    }
  )
  return gitHubCall.data.data
}
```

The `GITHUB_TOKEN` is needed for access to the GitHub GraphQL
endpoint.

For the `GITHUB_TOKEN` you can create that from your GitHub account,
the steps are, from your github profile page:

```bash
# Settings >
# Developer Settings>
# Personal access tokens>
# Generate new token>
# select repo access
```

Or use the link here: https://github.com/settings/tokens/new

The query can be something really simple to begin with to validate
it's working:

```ts
export default `
{
  viewer {
    id
    bio
  }
}
`
```

To consume the data somewhere else in your codebase:

```ts
import { getGitHubData } from './github-query'

async function dataGet() {
  const data = await getGitHubData()
  console.log('=====================')
  console.log(data)
  console.log('=====================')
}
```

If the query you're using takes variables then add that to the
`variables` object in the Axios request, in this example I've
hardcoded in my GitHub username:

```ts
import axios from 'axios'
import query from './query'

export async function getGitHubData() {
  const gitHubCall = await axios.post(
    `https://api.github.com/graphql`,
    {
      // query using ES6+ shorthand
      // query can be like query: query,
      query,
      variables: {
        username: 'spences10',
      },
    },

    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token ' + process.env.GITHUB_TOKEN,
      },
    }
  )
  return gitHubCall.data.data
}
```

The GraphQL query will look something like this:

```ts
export default `
query BIO_QUERY($username: String!) {
  user(login: $username) {
    id
    bio
  }
}
`
```

<!-- Links -->

[so]:
  https://stackoverflow.com/questions/52816623/graphql-post-request-in-axios
