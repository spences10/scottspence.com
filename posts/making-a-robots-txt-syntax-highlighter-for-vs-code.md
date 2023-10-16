---
date: 2023-10-16
title: Making a robots.txt syntax highlighter for VS Code
tags: ['reference', 'vscode', 'extension', 'robots.txt']
isPrivate: true
---

I was asking ChatGPT to read some posts from my site and summarise
them for me, I was a bit surprised when I got the response **"I wasn't
able to directly access the URL you provided due to restrictions on
the webpage."** from the bot. It was then that I recalled that I'd
blocked ChatGPT in the `robots.txt` file on my site. 😅

I've had all sorts of stuff added to that file over the years, and to
be honest, this is the only time I've know for sure that it works! 😂

Anyway, real quick, if you don't want ChatGPT crawling your site, add
this to your `robots.txt` file:

```text
# Specific directives for GPTBot
User-agent: GPTBot
Disallow: /
```

So, that's fine, right, but I wanted to add some syntax highlighting
to the file in VS Code, so I could see what I was doing. I had a quick
look on the marketplace, and there's nothing there that did that one
thing, so, I made one. 😁
