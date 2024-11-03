---
date: 2021-01-15
title:
  Using the GitHub GraphQL API in a serverless function - GraphQL vs
  REST
tags: ['api', 'graphql', 'vercel']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

This isn't a guide, this is me documenting the how and why for a proof
of concept project I worked on.

So, I started playing around with the GitHub GraphQL API endpoint to
do something I've been meaning to do for a wile now, that's to make a
serverless function that will return the GitHub stats from my GitHub
profile.

Me doing this came up in conversation with my friend [Paul Scanlon] and
he decided to do something similar but with the GitHub REST API, so we
are making notes on how things are going!!

## What is it you're doing though?

What I'm doing is based off of several [Leigh Halliday] videos on using
the GitHub GraphQL API and adding that data to a pie chart.

My current site has a similar pie chart in the about section which
created at build time. This chart is created at request time from the
client (the browser).

Check out the [Interactive example] for an idea of what's going on.

ℹ Also Leigh has just released Next Level Next.js where you can get
$10 off with [my affiliate link].

## Approach

The idea is to use a serverless function that will take in a GitHub
username and use that to query the GitHub GraphQL API and return data
related to the username.

The API data will then be used to populate a pie chart showing the
language split for that users repositories on their GitHub account.

Once that is done the serverless function will render the chart in
HTML and take a picture of the chart and return that as the response
to the client.

The serverless provider I'm using is Vercel, which in turn uses AWS
Lambda. This means that the code I want to run is triggered by an
incoming request to the code on the Vercel servers.

When I say incoming request I mean a URL, something like:

```url
https://serverless.vercel.app
```

Where the GitHub username would be passed in the request as a variable
and used for the GraphQL query, so the URL in my case would look
something like this:

```url
https://serverless.vercel.app?username=spences10
```

The code on Vercel then parses the request, takes out the `username`
variable and passes that to a [GraphQL query in Axios] which returns a
JSON object. The JSON is then manipulated to use in the pie chart.

## The query

The GitHub GraphQL API query looks like this:

```graphql
query GITHUB_USER_DATA_QUERY($username: String!) {
	user(login: $username) {
		repositories(
			last: 100
			isFork: false
			orderBy: { field: UPDATED_AT, direction: ASC }
			privacy: PUBLIC
		) {
			nodes {
				name
				description
				url
				updatedAt
				languages(first: 5) {
					nodes {
						color
						name
					}
				}
			}
		}
	}
}
```

This query will give the last 100 repos that aren't forks and are
publicly viewable for that GitHub username.

Here's what the response from the GraphQL query looks like:

```json
{
	"data": {
		"user": {
			"repositories": {
				"nodes": [
					{
						"name": "scottspence.com",
						"description": "My Letter Beautiful Mysterious Notebook.",
						"url": "https://github.com/spences10/scottspence.com",
						"updatedAt": "2021-01-18T17:35:19Z",
						"languages": {
							"nodes": [
								{
									"color": "#f1e05a",
									"name": "JavaScript"
								}
							]
						}
					}
				]
			}
		}
	}
}
```

## Map filter reduce

The JSON data from the GraphQL call is then transformed so it will go
into the data shape the pie chart is expecting.

Check out the [data transform] module on the repo for more detail and also
Leigh's video [Map, Reduce, Filter, and Pie Charts] is super helpful.

## Charts

I went with [Google chart library] first as it had what I needed
(Pie/Doughnut and Heatmap) but it's not responsive. This isn't a big
deal as the chart is being returned as an image.

To work with the chart locally I used the [live server] VS Code extension
and a added the chart to an `index.html` file to get an idea of how it
will look.

This really helped with getting the data from the API response to fit
with what the graph was expecting changing the data transform function
accordingly.

Here's a small sample of the `script` in the HTML file that indicates
the data it's expecting:

<!-- cSpell:ignore corechart -->

```html
<script type="text/javascript">
	google.charts.load('current', { packages: ['corechart'] })
	google.charts.setOnLoadCallback(drawChart)
	function drawChart() {
		var data = google.visualization.arrayToDataTable([
			['Languages', 'Languages Count'],
			['JavaScript', 37],
			['TypeScript', 13],
			['CSS', 12],
			['HTML', 7],
		])

		var options = {
			// title: 'My Languages Split',
			colors: ['#f1e05a', '#2b7489', '#563d7c', '#e34c26'],
			chartArea: {
				left: 0,
				top: 30,
				width: '100%',
				height: '90%',
			},
		}

		var chart = new google.visualization.PieChart(
			document.getElementById('doughnut'),
		)
		chart.draw(data, options)
	}
</script>
```

## Take a picture

Now that the data looks ok in the pie chart I want to take a picture
of it from a browser, but it's on a server, so I need to use a
headless browser like Chromium.

To do this I used Puppeteer I wanted to use Playwright but that didn't
work on Vercel so a reverted to Puppeteer like with the [serverless
open graph image] project I made a while back now.

## Latency

Loading the image does take a while, I've added this one below the
fold but because it's not part of Gatsby image there will be layout
shift unless I add a default height to the `img` tag.

![GitHub contributions pie chart]

Because this isn't being done at build time there is a noticeable
delay in the image being served sometimes.

There may be something I can do about it with some persisted queries
with OneGraph, not for this post though.

## Interactive example

You can check out the latency by changing my username in the live code
example here:

```js react-live
const user = `spences10`

const Image = () => {
	return (
		<img
			alt="GitHub user language split"
			style={{ width: '100%', height: '315px' }}
			src={`https://ghui.vercel.app/pie.png?username=${user}`}
		/>
	)
}

render(Image)
```

## Big boi function

I was poking around with the function on Vercel and found that the
size was at 90% 😬 the max size for AWS functions is 45mb, 99% od that
is taken up by Chrome AWS lambda anf d Puppeteer core.

This didn't really bode well as I'd only finished one part of it, the
next part will be a heat map.

<Tweet tweetLink="spences10/status/1348182082808328192" />

## Colour contrast on the graph

There was some contrast issues with the text on the pie chart so I had
to find a way to change the contrast of the text color.

After a bit of searching I found [contrast-color-generator] which
offered up a colour to satisfy the W3C guidelines.

This then had to be added to the [data transform] to change the colour
of the text.

Here's a small snippet of how the languages are add to an object:

```js {10}
const languagesArray = Object.entries(langObject).map(
  ([key, value]: any) => {
    return {
      id: key,
      label: key,
      value: value.count,
      color: value.color,
      textColor:
        value.color !== null
          ? generator.generate(value.color).hexStr
          : '#000000',
    }
  }
)
```

## Compared to the REST API

Paul has done a [great write up] on the contrast between the two
approaches.

I have outlined where my approach isn't great with the latency from
the function but there's a lot going on with that.

From what I could glean from Paul's approach is that the languages are
only the most used language whereas the GraphQL response is all the
languages used in and object.

If I used the REST API on the serverless function there would probably
be the same amount of latency.

## Resources

- [Map, Reduce, Filter, and Pie Charts]
- [How to use GraphQL with React]
- [Serverless OG Image - Part 1 - Deploying our first serverless function]
- [Serverless OG Image - Part 2 - Parsing Request]
- [Serverless OG Image - Part 3 - Temporary File]
- [Serverless OG Image - Part 4 - Taking Screenshot]

<!-- Links -->

[paul scanlon]: https://twitter.com/PaulieScanlon
[serverless open graph image]:
	https://scottspence.com/posts/serverless-og-images/
[leigh halliday]: https://www.youtube.com/user/leighhalliday
[map, reduce, filter, and pie charts]:
	https://www.youtube.com/watch?v=28StAxSjyIU
[how to use graphql with react]:
	https://www.youtube.com/watch?v=AUiUZ29pae4
[serverless og image - part 1 - deploying our first serverless function]:
	https://www.youtube.com/watch?v=Al3tCJKOydY
[serverless og image - part 2 - parsing request]:
	https://www.youtube.com/watch?v=ANedwsfXpO0
[serverless og image - part 3 - temporary file]:
	https://www.youtube.com/watch?v=KlLgjuUQoJs
[serverless og image - part 4 - taking screenshot]:
	https://www.youtube.com/watch?v=ZjGCiBpDZ7g
[my affiliate link]:
	https://courses.leighhalliday.com/next-level-next-js?coupon=SCOTT
[graphql query in axios]:
	https://scottspence.com/posts/get-graphql-data-with-axios/
[data transform]:
	https://github.com/spences10/github-user-information/blob/main/src/data-transform.ts
[interactive example]: #interactive-example
[live server]:
	https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
[google chart library]:
	https://developers.google.com/chart/interactive/docs/gallery
[contrast-color-generator]:
	https://www.npmjs.com/package/contrast-color-generator
[great write up]:
	https://paulie.dev/posts/2021/01/gatsby-netliyf-github-rest/

<!-- Images -->

[github contributions pie chart]:
	https://ghui.vercel.app/pie.png?username=spences10
