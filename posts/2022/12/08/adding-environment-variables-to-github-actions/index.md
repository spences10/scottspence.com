---
date: 2022-12-08
title: Adding Environment Variables to GitHub Actions
tags: ['ci-cd', 'github', 'e2e']
isPrivate: false
---

In this post, go over how to add environment variables to your GitHub
Actions. I recently added environment variables to [one of my GitHub
projects] recently and it stopped running.

In this case it was the environment variables for [Fathom Analytics],
which by the way is an awesome, privacy first analytics tool. If you
want to try it out, use my [referral link] for a $10 credit. Also, if
you want a laugh, check out the [commit history for adding `.env` the
variables]!

So, the workflow for the project is to test the meta tags using
Microsoft Playwright. Here's the workflow, taken straight from the
repo before adding the variables:

```yml
# https://snyk.io/blog/how-to-add-playwright-tests-pr-ci-github-actions/
name: 'Tests: E2E'
on:
  - push
  - pull_request
jobs:
  tests_e2e:
    name: Run end-to-end tests
    runs-on: ubuntu-latest
    steps:
      - uses: pnpm/action-setup@v2.2.4
        with:
          version: 6.0.2
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: install dependencies
        run: npm i && npm ci
      - name: install playwright browsers
        run: npx playwright install --with-deps
      - name: npm run test
        run: npm run test
```

Also check out the commented link in the workflow, from [Liran Tal]
for setting up your own workflow, great post!

This is the action after adding the variables:

```yml
# https://snyk.io/blog/how-to-add-playwright-tests-pr-ci-github-actions/
name: 'Tests: E2E'
on:
  - push
  - pull_request
jobs:
  tests_e2e:
    name: Run end-to-end tests
    runs-on: ubuntu-latest
    steps:
      - uses: pnpm/action-setup@v2.2.4
        with:
          version: 6.0.2
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: install dependencies
        run: npm i && npm ci
      - name: install playwright browsers
        run: npx playwright install --with-deps
      - name: npm run test
        run: npm run test
        env:
          PUBLIC_FATHOM_ID: ${{ secrets.PUBLIC_FATHOM_ID }}
          PUBLIC_FATHOM_URL: ${{ secrets.PUBLIC_FATHOM_URL }}
```

Pretty simple right? Add in the environment variables and you're good,
well, there's also the need to add them to the repo secrets.

Over on the GitHub repository, select the 'Settings' tab.

[![github-settings-tab]] [github-settings-tab]

In the left hand panel there's a 'Security' section where 'Secrets'
are, expand that and select 'Actions'.

[![github-security-actions]] [github-security-actions]

In the Actions tab you can add an 'New repository secret'.

[![github-new-repository-secret]] [github-new-repository-secret]

Add in the secret name and value, for the sake of continuity, I name
mine the same as what's in the repository. Then 'Add secret' and I'm
ready to go.

[![github-actions-secrets-new-secret]]
[github-actions-secrets-new-secret]

Now I'm done I can push the changes to GitHub and watch the action
run!

<!-- Links -->

[one of my github projects]:
  https://github.com/spences10/svead/pull/105
[commit history for adding `.env` the variables]:
  https://github.com/spences10/svead/pull/125
[fathom analytics]: https://usefathom.com
[referral link]: https://usefathom.com/ref/HG492L
[liran tal]: https://twitter.com/liran_tal

<!-- Images -->

[github-settings-tab]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1670763989/scottspence.com/github-settings-tab.png
[github-security-actions]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1670763989/scottspence.com/github-security-actions.png
[github-new-repository-secret]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1670763989/scottspence.com/github-new-repository-secret.png
[github-actions-secrets-new-secret]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1670763989/scottspence.com/github-actions-secrets-new-secret.png
