---
date: 2023-01-14
title: Should I create my own blog?
tags: ['writing', 'seo', 'analytics', 'notes']
isPrivate: true
---

There were a couple of Tweets I saw in quick succession today along
the lines of "Don't create your own blog, write on someone else's
platform instead". Now, as someone that has been blogging since April
2010 ([since 2016 here]) I can tell you it is absolutely worth doing.

So, I class myself as a fullstack developer, all the opinions here
will be geared toward someone that is in web development and wants to
share what they have learned.

Ok, here's a table comparing the pros and cons of using a blogging
platform vs owning your own blog. I've tried to be as objective as
possible here and I've more than likely missed some things. If can see
a glaring omission and it's triggering you, LET ME KNOW! I'll update
the table accordingly.

The ✔️ is a yes you get that pro or con, the ❌ is no you don't get
that pro or con.

<!-- markdown table with three columns -->

| Pros/Cons                      | Blogging Platform | Own Blog |
| ------------------------------ | ----------------- | -------- |
| Free Hosting                   | ✔️                | ✔️       |
| Built-in community features    | ✔️                | ❌       |
| Often free or low-cost         | ✔️                | ✔️       |
| Easy to set up and use         | ✔️                | ❌       |
| Customisation options          | ❌                | ✔️       |
| Control over monetization      | ✔️                | ✔️       |
| Ownership of content and data  | ✔️                | ✔️       |
| Governed by Terms of Service   | ✔️                | ❌       |
| More work to build a community | ❌                | ✔️       |
| Technical skills to set up     | ❌                | ✔️       |
| More responsibilities          | ❌                | ✔️       |
| Save time on maintenance       | ✔️                | ❌       |

Pretty cool! Pretty table out of the way, let's get into the details.

## Free Hosting

There was a time, back when I first got into web development that this
was a thing, rackspace was expensive and there were a lot of companies
that offered hosting plans. There's still a lot of companies today
that make their money from consumer web hosting.

These days, if you want to set up your own blog all you need is a HTML
file and a service like Netlify to host it for you, it's a literal
drag and drop of the file and it's up on Netlify, for free.

There's a _lot_ of other services that do this as well, Vercel,
Render, Surge are some I have used in the past. There's probably a lot
more, I've not checked.

These will offer services along the lines of hosting, SSL, CDN, DNS,
and more platform specific features that was a chore to set up in the
past.

**Conclusion**, marketing on blogging platforms may say otherwise but,
you get free hosting either way.

## Built-in community features

There's no denying that you get out of the box features when you use a
blogging platform. It's essentail to them to get other people involved
on their platform. Post commenting and the ability to follow someone
on there so that their posts will turn up in your feed.

This does mean that you're sort of locked into their ecosystem and you
have to go there to get new content or see when someone your following
has posted something new.

To build community, a lot of the posts that get amplified on these
platforms are from people on the platform that already have a large
social media following. This in turn brings more people to the
platfrom when they share their content on the socials.

This isn't to say that you can't have community features on your own
blog, like commenting. There's a lot of services out there that will
do this for you, you can even use GitHub issues as a way to have
commenting on your own blog.

The thing with having commenting on blog posts is that there's a lot
of spam.

[![spam-messages-on-hashnode]] [spam-messages-on-hashnode]

If you want to have people notified of when you post something new on
your blog you can use an RSS feed so that people can subscribe to your
blog and get notified when you post something new in their RSS reader
of choice.

**Conclusion**, you get these features out of the box on a blogging
platform, yes. But, you can have them on your own blog as well.

## Often free or low-cost

Have you heard the saying "if it's free you're the product"? Companies
like Google and Facebook collect a lot of data on you and it is worth
a lot of money to them.

Now I'm not saying that blogging platforms are doing this, but, how do
you think these platforms make their money?

Ads? Some do. Others pride themselves on not having ads on their
platform. How do they keep the servers running then?

Premium memberships, that give you an algorithmic boost in the feed? A
swag store?

Many of these platforms are funded by companies that will one day want
to see a return on their investment. How do you think they'll do that?

Some platforms haven't worked that out yet, but they will definitely
be asking for money at some point. Take Medium for example, the
darling of the tech blogging world five years ago, now they have a
paywall.

Full disclosure here, I'm at that point in my life now where I'm happy
to pay for a service for the sake of privacy and not having ads on the
platform (whatever platform that may be).

So, what about setting up your own blog? Well, let's look at the costs
involved in that. Here's a shopping list of things you'll need to set
up your own blog I've added in some other things as well that you
don't get with a blogging platform:

- domain
  - Depending on the top level domain you get (you can get a `.com`
    for around £11 a year)
- hosting
  - Netlify, Vercel, free
- SSL
  - Let's Encrypt, Netlify, Vercel, etc. free
- CDN
  - Netlify, Vercel, free up to a certain amount of traffic (it's a
    LOT)
- DNS
  - Free, again! I know and love using the Vercel DNS CLI!
- email
  - Not necessarily needed, but, if you want to have an email address
    that matches your domain do it.
- analytics
  - Again, not a deal breaker, but nice to know if anyone is visiting
    your site! Google Analytics is free, but, Google! I use Fathom
    Analytics (~£115 annually) one fee, unlimited sites.
- backup
  - All my content is stored in a git repo, so I can always go back to
    a previous version of my site if I need to.
- maintenance
  - I don't have to do anything to my site, it's just there. I don't
    have to worry about updates, security, etc. I just write and
    publish.

Like! Wow! That's a lot of stuff! Right?

Yes, but, you can get all of this for free as well.

Also, really, you don't need all of this stuff. You can get away with
a domain with SSL and hosting.

**Conclusion**, there's obviously a time investment in setting up your
own blog and a there can be _some_ costs involved. If you feel that
you won't get anything out of setting up your own blog then use a
blogging platform.

What I got out of setting up my own blog was a lot of knowledge on how
to set up and deploy websites, which is what I do for a living! So
time well invested for me 😊

## Easy to set up and use

Yeah, a blogging platform is designed for doing that, it's their
business model. They want you to be able to set up a blog and start
writing as quickly as possible. No brainer on that front.

Let's take a look at setting up your own blog. You need a GitHub
account and a Vercel account. You can authenticate with Vercel with
your GitHub account.

Pick a blog template, there's a few to choose from on GitHub. Here's a
couple I'd recommend:

- [Matt Jennings' SvelteKit Blog Template]
- [Mehdi Vasigh's SvelteKit MDSveX blog]

Both of these are specified as templates allowing you to create your
own repository from them.

There's even the option in GitHub to open the code directly in a
GitHub Codespace, which is a VS Code instance running in the browser.

Add your content, push it to GitHub and use one of the continuous
deployment features of Vercel or Netlify to deploy your site.

**Conclusion**, it's not as easy as using a blogging platform, but,
it's not _that_ hard either. You can be up and running in a short
time.

## Customisation options

Some blogging platforms have a lot of customisation options, allowing
you to change the layout to a predefined set of options.

Some platforms allow adding your own custom domain to map to and the
ability to add your own CSS stylesheet. Let's face it though, if
you've got to the point of having your own domain and customising the
CSS you're probably better off setting up your own blog.

**Conclusion**, some platforms allow you to customise your blog, to a
certain extent. You have free reign to what you want to add to your
own blog.

## Control over monetization

Some blogging platforms allow you to add web `monetization` pointers
to your blog, usually restricted to their provider of choice.

I'm not going to name names but I have seen a platform that replaced
the users pointer with their own. So, they're getting the monetisation
rather than the user. This was raised with them by me and one of my
friends and was glossed over.

Needless to say, you can use your preferred provider on your own blog
without any third party interference.

**Conclusion**, you have full control over monetisation on your own
blog.

## Ownership of content and data

## Platform terms of service

## More work to build a community

## Technical skills to set up

## More responsibilities

## Learning as you're doing

## Owning your content

## It's your SEO

## No rug pulls

<!-- Links -->

[since 2016 here]: https://scottspence.com/posts/hello-world
[matt jennings' sveltekit blog template]:
  https://github.com/mattjennings/sveltekit-blog-template
[mehdi vasigh's sveltekit mdsvex blog]:
  https://github.com/mvasigh/sveltekit-mdsvex-blog

[]:https://startafuckingblog.com/#posse-every-fucking-thing

<!-- Images -->

[spam-messages-on-hashnode]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1673703390/scottspence.com/spam-messages-on-hashnode.jpg
