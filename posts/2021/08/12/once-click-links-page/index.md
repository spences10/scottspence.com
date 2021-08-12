---
date: 2021-08-12
title: Deploy Your Own Links Page with One Click
tags: ['jamstack', 'vercel', 'netlify', 'guide', 'tailwind']
isPrivate: false
---

Having one place for all your social links is big business! Services
like [Linktree], [ContactInBio], [LinkBook], etc all offer the same
sort of service. One location for all your social links.

This is a nice project as a proof of concept to get you set up with
your own socials links. I've made this in conjunction with [Jamie
Barton] as a simple one click set up.

This was part inspired from a post from [Avneesh Agarwal] and from
some work Jamie had done a while ago. Avneesh's post on [Hashnode]
details making it with the NextJS framework.

This example is a full jamstack lightweight example using
Handlebars.js and Tailwind CSS.

All you need to do is enter your details into the prompts provided.
There's a choice of platforms Netlify or Vercel.

The one thing you'll need one of the following git hosting accounts:
GitLab, GitHub, or BitBucket. I'm guessing if you're reading this then
you have at least one of these already.

## Deploy with Netlify

Click the Deploy to Netlify button to start the proces.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/notrab/shortcuts)

You'll be prompted to connect to GitHub, this will create a public
repo for you.

![netlify-connect-github]

Then it's a case of adding in your links and usernames for the
different socials. Make sure to add full URLs i.e.
`https://www.youtube.com/scottspenceplease` if you don't have one of
the requested links add in `none` and it won't show up.

![netlify-configure-env-vars]

I've added in my links and usernames as an example here.

![netlify-configure-env-vars-example]

Clicking Save & Deploy will take you to the Netlify dashboard for the
site.

Clicking on the production deploy section will take you to the
published deploy.

![netlify-production-deploy-section]

Here you can click on the preview button to see the site.

![netlify-production-preview-button]

Done, as an extra step you can configure your own domain.

## Deploy with Vercel

Click the Deploy button to start the proces.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnotrab%2Fshortcuts&env=SHORTCUTS_NAME,SHORTCUTS_SITE,SHORTCUTS_TWITTER,SHORTCUTS_YOUTUBE,SHORTCUTS_GITHUB,SHORTCUTS_LINKEDIN,SHORTCUTS_DEVTO,SHORTCUTS_MEDIUM)

You'll be prompted to connect to GitHub, GitLab, or BitBucket.

![vercel-pick-git-provider]

You can give the repo a name, Vercel will create this repo for you. In
my case not to cause any naming issues I'll call this one
`vercel-shortcuts` then choose to create it as a private repo. Click
the create button.

![vercel-create-private-repo]

Skip the 'Create a Team' option!

Then in 'Configure Project' section much like the Netlify section I'll
add in my links and usernames, here's mine as an example.

![vercel-configure-env-vars-example]

Click that 'Deploy' button.

![vercel-congratulations]

Now I can click on the 'Go to Dashboard' button and visit the site.

## Wrap!

That's it, now you can have your own social links page.

If you want to take it further you can add in your own socials, the
code is available on Jamie's github [here].

Thanks for reading!

<!-- Links -->

[avneesh agarwal]: https://avneesh0612.hashnode.dev/
[hashnode]:
  https://avneesh0612.hashnode.dev/stop-using-linktree-build-your-own
[jamie barton]: https://twitter.com/notrab
[linktree]: https://linktr.ee/
[contactinbio]: https://contactinbio.com/
[linkbook]: https://linkbook.bio/
[here]: https://github.com/notrab/shortcuts/

<!-- Images -->

[netlify-connect-github]: ./netlify-connect-github.png
[netlify-configure-env-vars]: ./netlify-configure-env-vars.png
[netlify-configure-env-vars-example]:
  ./netlify-configure-env-vars-example.png
[netlify-production-deploy-section]:
  ./netlify-production-deploy-section.png
[netlify-production-preview-button]:
  ./netlify-production-preview-button.png
[vercel-pick-git-provider]: ./vercel-pick-git-provider.png
[vercel-create-private-repo]: ./vercel-create-private-repo.png
[vercel-configure-env-vars-example]:
  ./vercel-configure-env-vars-example.png
[vercel-congratulations]: ./vercel-congratulations.png
