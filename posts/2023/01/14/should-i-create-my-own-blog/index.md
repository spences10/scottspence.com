---
date: 2023-01-14
title: Should I create my own blog?
tags: ['writing', 'seo', 'analytics', 'notes']
isPrivate: false
---

There were a couple of Tweets I saw in quick succession today along
the lines of **"Don't create your own blog, write on someone else's
platform instead"**. Now, as someone that has been blogging since
April 2010 ([since 2016 here]) I can tell you it is absolutely worth
doing.

So, I class myself as a fullstack developer, all the opinions here
will be geared toward someone that is in web development and wants to
share what they have learned.

The setup I use for this blog is writing in Markdown, using SvelteKit
with MDSveX to render the Markdown into HTML with some additional
Svelte components added in for use in the Markdown. This is a feature
not supported by any blogging platform and reasoning for me to build
my own blog.

For an example of what I mean, take a look at the [Writing with
Markdown] post I did a while back for the interactive elements on
there.

## Let's compare

Ok, here's a table comparing the pros and cons of using a blogging
platform vs owning your own blog. I've tried to be as objective as
possible here and I've more than likely missed some things. If you can
see a glaring omission and it's triggering you, [LET ME KNOW]! I'll
update the table accordingly.

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
| Governed by Terms of Service   | ✔️                | ✔️       |
| More work to build a community | ✔️                | ✔️       |
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
are on there so that their posts will turn up in your feed.

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
up your own blog. I've added in some other things as well that you
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

I've put this as a con for the blogging platforms as a lot of them
don't offer this functionality.

Some blogging platforms _do_ have some customisation options, allowing
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
friends and was glossed over by the platform as a testing token.

Needless to say, you can use your preferred provider on your own blog
without any third party interference.

**Conclusion**, you have full control over monetisation on your own
blog. Blogging platforms can be hit amd miss with this.

## Ownership of content and data

Who reads the terms and conditions of a blogging platform? I know I
don't. I'll come onto that in the next section anyway, for now let's
discuss ownership of content and data.

So, when you sign up to these services there'll be a section in the
terms of service that says something along the lines of:

**"You grant us (blogging platform) a perpetual, worldwide,
royalty-free and non-exclusive license(s) do essentially what we like
with Your Content."**

Now, terms of service are usually a lot more wordy than that, but,
that's the gist of it. You're giving them the right to do what they
like with your content.

If you're cool with that then that's fine. Some blogging platforms
will offer up ways for you to import/export your data from other
platforms, why not, more content is more content, right? You're still
giving them the right to do what they like with your content once it's
on their platform.

I have an MIT license on my blog, so, this means that anyone can rip
it off and claim it as their own, which, by the way I see a _lot_ of
over on GitHub 👀. I'm cool with it as I have the SEO juice to back up
that I am the original author of the content, I'll come onto SEO
later.

**Conclusion**, you own your content and data on your own blog.
Blogging platforms will have terms of service that allow them to do
what they like with your content.

## Platform terms of service

With your own blog you're bound to the terms of service of the
platform you use. If you're using GitHub then you're bound to their
terms of service. If you're using Vercel then you're bound to their
terms of service.

The terms of service of a blogging platform is there to cover them if
there's anything in the user generated content that could possibly be
construed as illegal/unethical/copyright infringement or anything else
which could land them in legal hot water. They're not there to protect
you, they're there to protect "The Platform".

It's up to you to moderate your own content, keep comments clear of
spam which could infringe on the terms of service of the platform.
Otherwise you could find yourself in a situation where your account is
suspended or deleted.

**Conclusion**, you're bound to the terms of service of any platform
you use. They can decide to change these terms at any time and you, by
using the platform are implicitly agreeing to these changes.

## More work to build a community

Blogging platforms don't guarantee you'll build a community, gain
views, likes and comments just by using the platform. There's the
tools there to enable this, but people still need to find your
content.

A lot of platforms will have an algorithmically generated feed where
views, likes and comments are taken into account to determine what
content is shown to users.

So, the initial work to build a community is still on you. You need to
make people aware of your content, get them to view it, like it and
comment on it. Usually achieved by sharing the content on social
media. Pretty much the same as if you were using your own blog.

## Technical skills to set up

This point has been covered several times already in other sections
here. If you're a tech blogger then you're probably already
comfortable with setting up your own blog.

The only thing is the time investment.

**Conclusion**, blogging platforms make it easy to get up and running,
you're restricted to the features they offer however.

## More responsibilities

I have this as a pro for the blogging platforms, my thinking is that
all you have to worry about is adding your content on there.

With your own blog you have to take care of deploying new content,
this can be done with a git push to GitHub, and have a CD service on
Vercel take care of that part for you.

**Conclusion**, you're responsible for moderating your content, you're
responsible for building your community on both your own blog and a
blogging platform. With your own blog you could have issues with
deploying new content, you're responsible for making sure it's up and
running.

## Save time on maintenance

Again, I have this as a pro for the blogging platforms, all you have
to worry about is adding your content on there.

With your own blog you have security patches to apply to any packages
you may use, failed deployments to fix, and any other issues that may
arise.

The blogging platform is up and maintained by them, that's their
problem.

**Conclusion**, bloggin platforms win on this side only for the time
element. Again, for your own blog this can a learning experience which
will set you up for when this happens in the future.

## Additional notes

I've decided to add in som additional sections not covered in the
checklist here but feel that after researching this topic I should add
them in.

I haven't even touched on using a CMS, this, in my opinion is another
service to get locked into where they can switch up the terms of use
at any time.

## Learning as you're doing

The main benefit of creating your own blog is the learning along the
way, I'd say that almost all of the content on this site has came
about from me building a project in some form or another.

Your blog is your space to experiment, to learn, to build and to test
out new ideas. It's a continuous learning process and the opportunity
to feed that back into your site and share what you have learned in
the way of blog posts.

## It's your SEO

An advantage of having your own blog is that you can control the SEO.
Many blogging platforms will allow you to add a canonical link to the
content you add to their platform. This is a link to the original
source of the content (your blog).

So what you can do is add your content from you own blog onto other
blogging platforms, add the canonical link to your own blog and then
share the content on social media. The canonical link will tell the
search engines that the original source of the content is your blog.

If you have all your content on one platform without it pointing back
to and original source then you're missing out on the SEO juice there.

A couple of years ago I experimented with the effectiveness of a
blogging platforms SEO. I added original content on there, left it a
month or so then searched for specific phrases in a search engine. The
results weren't great, I couldn't find my content.

With searching for content on my blog I can find it, I can find it
quickly and I can find it in the search results.

This isn't to say that blogging platforms don't have SEO, they do, but
it's not as effective as having your own blog.

## Conclusion

Obviously, I went into this with a bias towards setting up your own
blog.

The main benefit from my point of view is that I get to learn how to
implement the features I want on my blog. I get to learn how to use
the tools I want to use. I get to learn how to build a community
around my blog.

The time investment for me is well worth it as I usually learn a lot
when implementing new features which ultimately turns into more
content to write about.

I've found that the only _real_ main difference is the time you want
to spend setting up your own blog. You're still bound to the terms of
service of the platform you use, you're still responsible for
moderating your own content and you're still responsible for building
your own community.

Any platform at any time can decide to shut up shop and you're left
without it.

Backups are important, so, if GitHub and Vercel decide to shut up shop
tomorrow I can start hosting my blog on a Raspberry pi on my kitchen
windowsill 😂.

<!-- Links -->

[since 2016 here]: https://scottspence.com/posts/hello-world
[matt jennings' sveltekit blog template]:
  https://github.com/mattjennings/sveltekit-blog-template
[mehdi vasigh's sveltekit mdsvex blog]:
  https://github.com/mvasigh/sveltekit-mdsvex-blog
[writing with markdown]:
  https://scottspence.com/posts/writing-with-markdown#markdown-headings
[let me know]: mailto:yo@scottspence.com

[]:https://startafuckingblog.com/#posse-every-fucking-thing

<!-- Images -->

[spam-messages-on-hashnode]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1673703390/scottspence.com/spam-messages-on-hashnode.jpg
