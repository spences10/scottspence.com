---
date: 2020-04-30
title: Moving Large Markdown Assets to a CDN
tags: ['learning']
is_private: false
---

I've spent a while today trying to bring down the size of this
project, I have several posts that are particularly large so I wanted
to work out a way to reduce that.

I'm an Ubuntu user and wanted to see if there was a way I could
identify the larger files in the project.

I found [this SO question] which details using the `du` command ([Disk
Usage]) which I used to list out the folder sizes. I put the following
command into my terminal:

```bash
du --max-depth=7 /home/scott/repos/thelocalhost/posts/ | sort -n
```

It gave a similar output to this:

<!-- cSpell:ignore mctwitbot -->

```
592   /thelocalhost/posts/2017/01/04/twitter-mctwitbot
2412	/thelocalhost/posts/2017/01/28/twitter-bot-bootstrap
38708	/thelocalhost/posts/2018/12/24/wsl-bootstrap-2019
```

The output was a bit noisier that what I've put here actually, lot's
of output, but it helped identify large assets in folders. That
`wsl-bootstrap-2019` folder is nearly 40mb in size! 😱

## Markdown file structure

I have become quite particular about my Markdown as of late and like
to [structure things in a certain] way. I started to do this with the
images and gifs that are in here as well.

So, as an example this:

```markdown
![twitter logo](./twitter-bird.png)

I got to doing this from finding it on [GitHub](https://github.com) I
think I was looking for the Twitter icon in bootstrap whilst
working...
```

Will become this:

```markdown
![twitter logo]

I got to doing this from finding it on [GitHub] I think I was looking
for the Twitter icon in bootstrap whilst working...

<!-- Links -->

[github]: https://github.com

<!-- Images -->

[twitter logo]: ./twitter-bird.png
```

It looks like the second option here takes more space but the links at
the bottom of the document aren't visible and it makes the writing
experience a lot easier to parse and manage when there are a lot of
links and assets in the document.

## Cool story bro

So I'm putting this here to document what I did, the assets in the
large folder I mentioned earlier have now been removed and added to
the Now CDN in their own folder.

So now at the end of each document, rather than have a load of local
files in the same folder they can all be references to the CDN.

How do I add them to a CDN? I make a folder with the same(ish) folder
structure then reference the CDN in place of the local images:

```text
images-on-now-sh/
├─ 2020/
├── this-post-im-talking-about/
│   ├─ image1.png
│   ├─ image2.png
│   └─ image3.png
```

<!-- cSpell:ignore weserv -->

The whole reason I did this was so that if I wanted to I could run all
these through a service like [Images.weserv.nl] where I could add the
URL to their service like so:

```text
[image1]: //images.weserv.nl/?url=https://images-on-now-sh/2020/this-post-im-talking-about/image1.png&w=300&h=300
```

I've not done that as yet, I have got a 25% faster build time for the
site though.

## What CDN?

The CDN I talk about is Vercel's Now platform, which I think in time
is going to be called just Vercel, as the Now bot that used to look
after your GitHub deploys is now called Vercel so they may be
consolidating everything into _just_ Vercel.

I loaded the assets to the Vercel CDN with the Now CLI, so in the
folder that contains the assets do a `now` or `now --prod` to push the
assets to the Vercel CDN.

Any time I now have a post with a lot of assets images I'm not going
to feel that bad about adding them. I have however stopped doing this
so much and instead try to provide a video detailing something with
accompanying copy.

<!-- Links -->

[this so question]:
  https://serverfault.com/questions/200949/how-can-i-find-the-biggest-directories-in-unix-ubuntu
[structure things in a certain]:
  https://scottspence.com/posts/add-tracking-links-to-your-markdown/#the-other-problem-for-me-anyway-
[disk usage]: https://ss64.com/bash/du.html
[images.weserv.nl]: https://images.weserv.nl/docs/#how-it-works

<!-- Images -->
