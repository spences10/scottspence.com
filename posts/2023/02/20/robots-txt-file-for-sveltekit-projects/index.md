---
date: 2023-02-20
title: Robots.txt file for SvelteKit projects
tags: ['sveltekit', 'guide', 'seo']
isPrivate: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

Here's a real quick one on making sure you don't blow your crawl
budget on your SvelteKit project JavaScript files.

I noticed this <DateDistance date='2022-05-15'/> ago and didn't write
about it. Tangentially related, I've recently been having a bit of a
mare with Google indexing things I don't want it to. So now I'm
sharing it with you to help if you're having similar issues.

So, I first noticed this when I was working with the absolute SEO
legend that is [Dino Kukic]! He clued me into finding where your crawl
budget is going in the Google Search Console.

To check your Google crawl stats, from the Google search Console on
the main page go to the 'Settings' section for the site you want to
check.

Then click on 'OPEN REPORT' for the 'Crawl Stats' section and you'll
see the crawl requests breakdown.

In my case, the 'By file type' section was showing that I was using up
a lot of my crawl budget on JavaScript files, like 30% of my crawl
budget was being used on JavaScript files.

From what I can glean, JavaScript content for the Google bot isn't
primary content and HTML should be prioritised.

So, in my `robots.txt` I'll add in a `Disallow` to stop the JavaScript
files from being crawled.

```text
# https://www.robotstxt.org/robotstxt.html
User-agent: *

Disallow: /*.js$
Disallow: /*.json
Disallow: /analytics.json
Disallow: /current-visitors.json
```

The asterisks allows any file name, the dollar sign ensures it only
matches the end of an URL and not a oddly formatted url (e.g.
/locations.json.html)

I've also added in a few other paths that I don't want to be crawled
like the `analytics.json` and `current-visitors.json` API endpoints.

If you go to the GitHub for this site and check out the `robots.txt`
file you'll also see a ton of additional `Disallow` rules that I've
added in to stop Google from crawling things I don't want it to.

<!-- Links -->

[Dino Kukic]: https://twitter.com/DinoKukic
