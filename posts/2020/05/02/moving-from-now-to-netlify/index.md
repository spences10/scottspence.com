---
date: 2020-05-02
title: Moving from Now to Netlify then back to Now
tags: ['learning']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

I am a massive fan of both Vercel's [Now.sh] platform and the
[Netlify] platform.

This post has been in my drafts since the beginning of March 2019. At
that time it was titled **'Moving from Now to Netlify'** and it was
mostly me being salty about the configuration of the Now service.

At that time I had fallen for Netlify and was swooning over it's super
simple deployments and domain management. That along with it's awesome
caching making your Lighthouse audits something you'd boast about on
Twitter.

Yeah, those people are the _worst_!

<Tweet tweetLink="spences10/status/1249078453506396160" />

Ha! Yes, guilty!

**Anyhoo!** Like the fickle Twitter driven web developer I am,
switching technology every week is expected! 😂

So now I'm back in the [Now.sh] camp. **Why?** I could say it's
because I prefer the new name change from ZEIT to Vercel.

It's not, I could say that it's because Vercel has massively upped
their game in the last two years. They have but it's not that either.

[Netlify] is an awesome platform and I love working with it, I'd
absolutely recommend it to anyone.

I like to the convenience of being able to switch at between them, so
if I decide I want to go with x platform I can up and move relatively
quickly [with no downtime].

## Vercel's Now.sh platform is also a CDN

I'm going through all the assets in posts on here and adding them with
the Now CLI so I can use a link to them directly, or through a service
like [Images.weserv.nl] for further optimisations.

I know that Gatsby will optimise images on the fly for best sizes I'm
doing this as a learning exercise as much as was to improve
performance.

I'll probably be back on Netlify or the next new hotness by the time
you're reading this!

## What I've learned

Try to keep things with as little lock in as possible so you can truly
utilise the content mesh.

The irony here is that I've completely flip flopped from one back to
the other but as I have my domains with Namecheap all I need to do is
change the DNS configuration and we're done!

In the past I purchased some domains with Vercel but if I wanted to
move then I'd need to migrate the domain or at lease configure the DNS
with the Now CLI.

Domain management with Vercel Now CLI is something that I have always
been _ok_ managing. I did find the Netlify console just as
straightforward to use but if you find the terminal a bit daunting for
something like this then Vercel now have a [DNS integration] that
makes it a lot more visual.

<!-- LINKS -->

[now.sh]: https://now.sh
[netlify]: https://www.netlify.com/
[greenkeeper.io]: https://greenkeeper.io
[images.weserv.nl]: https://images.weserv.nl/docs/quick-reference.html
[with no downtime]:
  https://vercel.com/guides/zero-downtime-domain-migration
[dns integration]: https://vercel.com/integrations/dns
