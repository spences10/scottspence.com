---
date: 2020-04-16
title: Create a Custom Domain for Fathom Analytics
tags: ['analytics', 'learning', 'guide']
isPrivate: false
---

<script>
  import Tweet from '$lib/components/tweet.svelte'
</script>

Fathom Analytics recently added a really neat feature for [custom
domains] with their service.

What does that mean then? Well it's for bypassing ad-blocking
extensions, not that Fathom wants to collect all your data, [far from
it].

The purpose of this post is to cover setting up my custom domain as I
have a specific domain provider and I'm using Vercel's now.sh and
Netlify for hosting my projects I want to add the Fathom custom
domains to.

Fathom has provided instructions for [Godaddy], [CloudFlare], [Hover]
and [NameCheap] however, Like I mentioned, I have a custom DNS with my
domain provider and I'm not be able to add a new CNAME record which is
what I need to generate my Fathom custom (sub)domain.

## Create a custom domain

Fathom's [documentation] covers it pretty well, you go into your
settings panel on Fathom and add in the domain of your site which I
followed, pretty straight forward.

Fathom then give me two values, the first is the sub-domain that I'm
going to create and the other is the Fathom DNS server.

![fathom dns record for a site]

## Add the custom domain to my site

I set about working out how to add a CNAME to this blog but couldn't
find any good examples so I reached out to Fathom with a tweet:

<Tweet tweetLink="spences10/status/1250786419536277505" />

After I sent that I found [this gist] which detailed the command for
adding the sub-domain which made sense to me.

## Add DNS record in Vercel's now.sh

With the two values from Fathom dashboard, the CNAME is the sub-domain
and the VALUE is the DNS server.

So in the now CLI I did the following:

```bash
now dns add randomsite.com cdrjcy CNAME starman.fathomdns.com
```

Then I checked that the changes were added using the now dns command
to list out my DNS settings:

```bash
now dns ls
```

It depends on how quickly these are propagated to see if the record is
created, for me it was a refresh on the Fathom dashboard and it said
the domain was active with a couple of emails from Fathom to confirm
they were created.

## DNS Editor for Vercel domains

It was after I worked out how to add the CNAME with the CLI that I
found the [DNS Editor for Vercel domains] which Jack mentioned in the
reply to my tweet! 🤦‍♂

It's a free integration on the Vercel Marketplace which is super
straightforward to use once you add it to your Vercel account you can
pick it from the Integrations section on your Vercel Dashboard.

## Select custom domain in site settings

Now that the domain is set up I need to select that in the Sites
dashboard, click on the Site ID for my site the pick the domain from
the select list and verify it's working on my site that is already
configured with Fathom.

I'm going to do the same with Netlify now, it's a bit more pick my
domain scroll to the bottom of the list and select 'Add new record',
add the details from the Fathom Domains page.

![create new dns record netlify]

## Add DNS record in Netlify

![pick custom domain in site settings]

straightforward with Netlify, I go to my sites page, select Domains,
It didn't take long to validate the record in the Fathom setting page
then I picked the custom domain like I did in the previous step.

## Configure Gatsby to use the custom domain

Fathom have now added instructions for adding the Fathom tracking
snippet [to your Gatsby site].

This involves customising the Gatsby [`default-html.js` file] and
adding the snippet before the `<head>` starts.

So for me, following the Fathom instructions, copy the
`default-html.js` file from the `.cache` directory to the `src`
directory:

```bash
cp .cache/default-html.js src/html.js
```

That command presumes that the Gatsby develop command has been run at
least once so the `.cache` directory has been created.

So now go to the `default-html.js` file and add in the Fathom snippet,
here's what it should look like:

```js
import PropTypes from 'prop-types'
import React from 'react'

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <script
        src="https://cdrjcy.randomsite.com/script.js"
        spa="auto"
        site="NYMDTPLM"
        defer
      ></script>
      <head>
        <meta charSet="utf-8" />
        ...
```

Now that's there I can build the site locally and test the analytics
is working.

## Remove `gatsby-plugin-fathom`

Now that I'm using the `default-html.js` for the Fathom snippet
there's no need to have the Gatsby plugin for Fathom installed, so
that's one less plugin to have installed.

Done!

<!-- Links -->

[custom domains]: https://usefathom.com/blog/bypass-adblockers
[far from it]: https://usefathom.com/blog/bypass-adblockers
[documentation]: https://usefathom.com/support/custom-domains
[godaddy]: https://ca.godaddy.com/help/add-a-cname-record-19236
[cloudflare]:
  https://support.cloudflare.com/hc/en-us/articles/360020615111-Configuring-a-CNAME-setup
[hover]:
  https://help.hover.com/hc/en-us/articles/217282457-Managing-DNS-records-#h_5eab4aa7-b044-4cc6-a3c0-5869f583edc8
[namecheap]:
  https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain
[this gist]:
  https://gist.github.com/jaydenseric/f4147d7d9788d1f46b30e4ac7b57e6b2
[dns editor for vercel domains]: https://vercel.com/integrations/dns
[to your gatsby site]: https://usefathom.com/integrations/gatsbyjs
[`default-html.js` file]: https://www.gatsbyjs.org/docs/custom-html/

<!-- Images -->

[create new dns record netlify]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858540/scottspence.com/create-new-dns-record-netlify-388b4824b94966a449b57c7fd59f5fa8.png
[pick custom domain in site settings]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858539/scottspence.com/pick-custom-domain-in-site-settings-3af1a934a7a66f45d754f3cfa36bb80e.png
[fathom dns record for a site]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858539/scottspence.com/fathom-dns-record-for-site-918a662955a145472c8b3a65061649e2.png
