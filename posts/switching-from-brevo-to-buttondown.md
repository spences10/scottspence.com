---
date: 2023-10-01
title: Switching from Brevo to Buttondown
tags: ['notes', 'email', 'buttondown']
isPrivate: false
---

<script>
  import { NewsletterSignup } from '$lib/components'
  import { Tweet } from 'sveltekit-embed'
</script>

Ok, so, back at the start of the year, I switched from Revue (remember
that? 😅) to Brevo (Send In Blue at the time) and made a concerted
effort to use it as I paid quite a premium for it! There was some fun
around [setting up DKIM records] for the domain too.

It soon became a chore to use though, the email interface was clunky
and everything had to go into a campaign which you had to schedule to
send. In particular, I didn't like that I couldn't just write
something down and send it! There' were all these weird parts of the
UI that kept being buggy, namely adding in links, the interface was
dreadful.

## Enter Buttondown

I'd had a Buttondown account since 2018 but never used it, or
considered it! It wasn't until I was checking out one of [Geoff
Rich]'s newsletters that I decided to check it out again.

One of the key features for me in an email service is being able to
have people sign up for the newsletter through my site via API. This
isn't a free feature of Buttondown but for $90 for the year it was
over three times less than what I paid for Brevo!

There was a bit of work that went into setting up the API access, I
already had a server endpoint I was submitting to but I wanted to use
a form action instead of a fetch request. You can [check out the
changes over on GitHub] if you're interested.

Emails are sent from the `buttondown.email` domain with my Buttondown
username so, `spences10@buttondown.email`. I'm intentionally not
sending from my own domain. I absolutely can send from my own domain
if I want to but, reasons! I'll get into that in a bit.

If you're on the mailing list you'll probably notice the reply email
address is a bit weird, this is a Fastmail masked email address. I use
it because I like to have individual email addresses for different
services. I've seen old primary email addresses end up in too many
data leaks to mention.

## Markdown is bae!

Another big plus for using Buttondown is that I can write my emails in
Markdown! It's where I write all my blog posts and it's where I'm most
comfortable.

Want to add something to the email that's not supported by the
platform? Sweet! Just start adding in HTML and it'll render it as
you'd expect.

Copy paste links and Buttondown will show a preview card if it's
supported, I can even copy paste an image (like on GitHub) and an
Amazon S3 bucket link will be generated for me linking the image in
the Markdown.

## Other services considered

I sent out a tweet asking for recommendations and got a few replies,
my old GraphCMS colleague [Frederik Eychenié] suggested that [sending
from
your own platform has become nearly impossible] which was an interesting
read.

<Tweet tweetLink="spences10/status/1705661419369185746" />

Several suggestions from Svelte Society community leader [Kev] I'll
list here if you're interested:

- [Keila](https://www.keila.io)
- [Listmonk](https://listmonk.app)
- [Dittofeed](https://github.com/dittofeed/dittofeed)

There was also [resend], which I set up and account for and was
testing out but I was also a pain to get set up, so canned it after
reading that post from Frederik.

The main thing with the 'roll your own' services is that the work that
goes into them was far beyond what I was willing to put in.

Again, thinking back to that post from Frederik, I'm not sure I want
to be setting up MX records for another service and having them
associated with my domain. I still have Brevo set up for my domain and
I'll have to rectify that at some point.

Also the crafting of the emails in something like
[Maizzle](https://maizzle.com) then shunting them off to be hosted on
my site somewhere was a bit of a faff.

## Interested in the newsletter?

You can sign up here! One of the reasons I prefer [creating my own
platform] if for things like this! 😊

I can import the component and use it in this Markdown file. 🔥

I mainly share what I've been working on, blog posts and upcoming
Svelte Society London events.

<NewsletterSignup />

## Interested in Buttondown?

If you're interested in Buttondown you can sign up with [my
referral link], you get $9 off your first month! 🎉

## Conclusion

Switching from Brevo to Buttondown has streamlined my newsletter
management process, rendering it less of a chore and more of an
enjoyable endeavour.

Being able to integrate the newsletter sign-up on my website via API
was a highlight, ensuring a smooth transition.

While there were alternative services the additional setup and
management they required didn't align with my preference for a
hassle-free solution.

The ability to compose emails in a familiar Markdown environment,
insert HTML when needed is all I'm after.

If you're on a lookout for an email service that simplifies newsletter
management Buttondown might be the right fit. Plus, with a referral
discount awaiting, it's worth giving a shot.

Thanks for reading, I hope you found this useful.

<!-- Links -->

[setting up DKIM records]:
	https://scottspence.com/posts/adding-dkim-records-to-vercel
[geoff rich]: https://geoffrich.net
[check out the changes over on GitHub]:
	https://github.com/spences10/scottspence.com/pull/665/files
[my referral link]: https://buttondown.email/refer/spences10
[creating my own platform]:
	https://scottspence.com/posts/should-i-create-my-own-blog
[Frederik Eychenié]: https://twitter.com/feychenie
[sending from your own platform has become nearly impossible]:
	https://cfenollosa.com/blog/after-self-hosting-my-email-for-twenty-three-years-i-have-thrown-in-the-towel-the-oligopoly-has-won.html
[resend]: https://resend.com
[kev]: https://twitter.com/kevmodrome
