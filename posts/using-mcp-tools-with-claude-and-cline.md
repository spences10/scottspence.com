---
date: 2025-01-19
title: Using MCP Tools with Claude and Cline
tags: ['mcp', 'claude', 'tools', 'svelte', 'learning', 'notes']
is_private: false
---

<script>
  import { Bluesky, YouTube } from 'sveltekit-embed'
  import { Details } from '$lib/components'
</script>

Aight! I've been playing around with using and creating my own Model
Context Protocol (MCP) tools lately. I also talked myself into giving
a talk at the next Svelte London event to share what I've learned.
It's a bit of a stretch talking about AI tools at a Svelte meetup but,
using these sorts of tools is helping me stay current with the Svelte
5 changes. The thing is that a lot of LLM training data cut off is
after the launch of Svelte 5.

## Training data cut-off

A lot od the LLM data you find will be centred around Svelte 4. You
ask your AI assistant about the latest Svelte 5 features, and it's
like "Sorry, I was trained on data from [insert date here]." or it'll
straight up just lie to you 😅

[Stanislav Khromov](https://github.com/khromov) has done a great video
on this, explaining the gap there is and how biases in the training
data can lead to incorrect results.

<YouTube youTubeId='tprMklFzy44'/>

The approach is essentially giving all of the Svelte 5 documentation
to the LLM in a Claude project as the project data.

I was doing something similar when I was working on Svelte 5
implementations. But, now, with the MCP tooling approach I'm
essentially giving the LLM the tools it needs to get the job done.

## Cline "make me a tool"

Where I work we are all encouraged to use Cursor, it's a great tool
that really does help you get stuff done and has vastly improved the
velocity on the team. I also evaluate other tools for use, Cline being
one of them. With Cline you can say something like "hey make me a tool
to do 'x'" and it'll go off and create it! It's not perfect and it can
get pretty expensive in credits when iterating on something.

Initially I couldn't get Claude Desktop (so I gould use MCP tools with
it) to work with my WSL set up, I did work that out though, you can
check out the post on
[Getting MCP Server Working with Claude Desktop in WSL](https://scottspence.com/posts/getting-mcp-server-working-with-claude-desktop-in-wsl).

The reason I wanted to have MCP tools working with Claude Desktop is
because Cline (as I mentioned earlier) can get really expensive! So I
really wanted to be able to use the MCP tools in Claude so I wasn't
having my credits rinsed each time I used Cline in my editor.

Here's a really good video on using MCP tools with Claude:

<YouTube youTubeId='R-5ucM-5P5o'/>

There's a pinned comment detailing custom instructions for using MCP
with Claude, that instruction set got me thinking reading through it.

## MCP tools I use

You can find a the list of official and community MCP servers over on
the
[Model Context Protocol GitHub](https://github.com/modelcontextprotocol/servers).
There's also [Glama](https://glama.ai/mcp/servers) and
[Smithery](https://smithery.ai/) where you can search for MCP servers.

The tools I have configured with my Claude Desktop:

- [Brave Search](https://github.com/modelcontextprotocol/servers/blob/main/src/brave-search)
- [Sequential thinking](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking)
- [Jina AI Reader](https://github.com/spences10/mcp-jinaai-reader)
- [Tavily Search](https://github.com/spences10/mcp-tavily-search)
- [Memory LibSQL](https://github.com/spences10/mcp-memory-libsql)

I use them with a custom prompt that I adapted from the pinned comment
on the video I mentioned earlier. You can find the prompt I use as
[a Gist over on GitHub](https://gist.github.com/spences10/2996f6f2a022d297a5f6b518facb16de)
that I copy paste into my Claude instructions and adapt for Claude
projects.

## The MCP tools I've built

Ok, I'll go over the tools I built and the reasoning behind them. I
mean, other than the reason being I wanted to create some MCP tools to
understand how they work.

## mcp-memory-libsql

So, there's a
[Memory](https://github.com/modelcontextprotocol/servers/blob/main/src/memory)
MCP tool, which I needed for a project I was working on at work. The
thing was that it was in a `.json` file located with the `npx`
download of the tool. We use a Teams Claude account at work so this
needed to be shareable/configurable, so, I used my fave portable db
SQLite in libSLQ.

This means that the database can live on Turso and the whole team can
access it!

## mcp-tavily-search

I heard about Tavily from a coupe of videos and someone mentioned it
in a AI Engineer talk so I thought I'd give it a go. I use this in
conjunction with Brave Search and have the LLM contrast the results
from both.

## mcp-jinaai-reader

Jina AI Reader is dope! I've used it in the past to get LLM friendly
web page data. There's tools like
[Puppeteer](https://github.com/modelcontextprotocol/servers/blob/main/src/puppeteer)
and [Playwright](https://github.com/executeautomation/mcp-playwright)
that can be used to get website data, but, for my use case (finding
documentation and parsing it) they were slow to start up and slow to
operate.

## Putting it all together

So, with my MCP tool hooked up to Claude Desktop I can start shaping a
prompt that will instruct Cline to go to the Svelte Blog, pull the
latest post from there, identify new features mentioned on the post,
read the docs for that feature and create a focused demo about it.

So, with some prompting in Claude Desktop I got to this:

```text
Use sequential thinking to help me create a Svelte 5 demo app:

1. Feature Discovery: a. Use Jina.ai reader to parse
   https://svelte.dev/blog b. Extract the URL of the latest blog post
   c. Use Jina.ai reader to parse that specific post d. Identify any
   new Svelte 5 features mentioned e. Extract any documentation links
   for the identified feature

2. Documentation Analysis: a. Use Jina.ai reader to parse the
   feature's documentation page b. Extract implementation details and
   usage patterns c. Note any important considerations or gotchas

3. Based on the documentation, implement a focused demo that:
   - Uses the newly discovered feature
   - Implements it with proper Svelte 5 syntax:
     - $state(value) for reactive state (no imports needed)
     - $derived(expression) for computed values
     - onclick={handler} for events
   - Uses the existing DaisyUI setup for styling

Note: The project is already bootstrapped with all needed
dependencies - no package installation required.

Document your analysis and implementation thought process throughout
these steps.
```

Super open ended! But specific enough for the LLM to know what to do.

Notice that I still had to correct the LLM for Svelte 5 events though?
Cline would regularly get it wrong, using the `on:click` syntax.

```text
✔️ Task Completed I've created a task prioritisation demo that
showcases key Svelte 5 features:

1. New Runes System:

   - Used $state for reactive variables (tasks, new_task,
     priority_filter)
   - Used $derived for computed values (filtered_tasks, task_stats)
   - Demonstrated proper TypeScript integration with runes

2. Modern Event Handling:

   - Implemented new event syntax without colons (onclick instead of
     on:click)
   - Used proper event typing with HTMLSelectElement

3. Reactive Features:

   - Real-time task statistics updates
   - Dynamic filtering system
   - Automatic UI updates when task priorities change

4. DaisyUI Integration:

   - Styled components using DaisyUI classes
   - Responsive layout with proper spacing
   - Color-coded priority indicators

The demo successfully demonstrates Svelte 5's improved reactivity
system while maintaining a clean, type-safe codebase. The app provides
a practical example of task management with priority-based
organization, filtering, and real-time statistics.
```

Here's the demo, take a look, one page, one shot (after initial
prompting in Claude Desktop):

<Details button_text="+page.svelte" styles="lowercase">

```svelte
<script lang="ts">
	interface Task {
		id: string
		text: string
		priority: 'high' | 'medium' | 'low'
		created_at: Date
	}

	type Priority = Task['priority'] | 'all'

	// Task state
	let tasks = $state<Task[]>([])
	let new_task = $state('')
	let priority_filter = $state('all')

	// Derived values
	let filtered_tasks = $derived(
		priority_filter === 'all'
			? tasks
			: tasks.filter((t) => t.priority === priority_filter),
	)

	let task_stats = $derived({
		total: tasks.length,
		high: tasks.filter((t) => t.priority === 'high').length,
		medium: tasks.filter((t) => t.priority === 'medium').length,
		low: tasks.filter((t) => t.priority === 'low').length,
	})

	// Event handlers
	function add_task() {
		if (!new_task.trim()) return
		tasks = [
			...tasks,
			{
				id: crypto.randomUUID(),
				text: new_task,
				priority: 'medium',
				created_at: new Date(),
			},
		]
		new_task = ''
	}

	function delete_task(id: string) {
		tasks = tasks.filter((t) => t.id !== id)
	}

	function update_priority(id: string, priority: Task['priority']) {
		tasks = tasks.map((t) => (t.id === id ? { ...t, priority } : t))
	}
</script>

<div class="container mx-auto max-w-3xl p-4">
	<h1 class="mb-6 text-3xl font-bold">Task Prioritisation</h1>

	<!-- Task Input -->
	<div class="mb-6 flex gap-2">
		<input
			type="text"
			placeholder="Add new task..."
			class="input input-bordered flex-grow"
			bind:value={new_task}
			onkeydown={(e) => e.key === 'Enter' && add_task()}
		/>
		<button class="btn btn-primary" onclick={add_task}>
			Add Task
		</button>
	</div>

	<!-- Stats -->
	<div class="stats mb-6 w-full shadow">
		<div class="stat">
			<div class="stat-title">Total Tasks</div>
			<div class="stat-value">{task_stats.total}</div>
		</div>
		<div class="stat">
			<div class="stat-title">High Priority</div>
			<div class="stat-value text-error">{task_stats.high}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Medium Priority</div>
			<div class="stat-value text-warning">{task_stats.medium}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Low Priority</div>
			<div class="stat-value text-success">{task_stats.low}</div>
		</div>
	</div>

	<!-- Filter -->
	<div class="join mb-6">
		<button
			class="btn join-item {priority_filter === 'all'
				? 'btn-active'
				: ''}"
			onclick={() => (priority_filter = 'all')}
		>
			All
		</button>
		<button
			class="btn join-item {priority_filter === 'high'
				? 'btn-active'
				: ''}"
			onclick={() => (priority_filter = 'high')}
		>
			High
		</button>
		<button
			class="btn join-item {priority_filter === 'medium'
				? 'btn-active'
				: ''}"
			onclick={() => (priority_filter = 'medium')}
		>
			Medium
		</button>
		<button
			class="btn join-item {priority_filter === 'low'
				? 'btn-active'
				: ''}"
			onclick={() => (priority_filter = 'low')}
		>
			Low
		</button>
	</div>

	<!-- Task List -->
	<div class="space-y-4">
		{#each filtered_tasks as task (task.id)}
			<div class="card bg-base-200">
				<div
					class="card-body flex-row items-center justify-between p-4"
				>
					<div class="flex-grow">
						<p class="text-lg">{task.text}</p>
						<p class="text-sm opacity-60">
							Created: {task.created_at.toLocaleString()}
						</p>
					</div>
					<div class="flex items-center gap-2">
						<select
							class="select select-bordered select-sm"
							value={task.priority}
							onchange={(e) =>
								update_priority(
									task.id,
									(e.target as HTMLSelectElement)
										.value as Task['priority'],
								)}
						>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
						<button
							class="btn btn-square btn-error btn-sm"
							onclick={() => delete_task(task.id)}
						>
							×
						</button>
					</div>
				</div>
			</div>
		{/each}

		{#if filtered_tasks.length === 0}
			<div class="bg-base-200 rounded-lg p-8 text-center">
				<p class="text-xl opacity-50">No tasks to show</p>
			</div>
		{/if}
	</div>
</div>
```

</Details>

It's a toy example, yes, but, this is for a talk I'm giving where I
don't want to give exact instruction rather show off the capabilities
of the tools.

## Why This Matters

If you're working with Svelte (or any rapidly evolving framework),
LLMs aren't going to hold all the answers. These tools help you:

- Get accurate, up-to-date information
- Validate implementation approaches
- Keep your AI assistant's knowledge fresh

## Future Development

I've recently published an MCP tool for the Svelte docs:

Paolo mentioned it on Bluesky:

<!-- cspell:ignore ezyrzvz,yoglekd,szmiys,bsky -->

<Bluesky
	post_id="did:plc:ezyrzvz3yoglekd4j2szmiys/app.bsky.feed.post/3lg3pib236k2h"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

Then I published it the next day:
https://github.com/spences10/mcp-svelte-docs

I'm currently incorporating that into my prompts now to see how it
goes!

## Resources and Links

Check out the repos:

- [mcp-memory-libsql](https://github.com/spences10/mcp-memory-libsql)
- [mcp-tavily-search](https://github.com/spences10/mcp-tavily-search)
- [mcp-jinaai-reader](https://github.com/spences10/mcp-jinaai-reader)
- [mcp-svelte-docs](https://github.com/spences10/mcp-svelte-docs)

## Getting Started

Want to try this out yourself? Here's what you need:

1. Basic knowledge of Svelte
2. Claude Desktop set up
3. If you're on Windows, WSL configured
   ([I've got a post on that!](https://scottspence.com/posts/getting-mcp-server-working-with-claude-desktop-in-wsl))

## Conclusion

Working with MCP tools has been a bit of a game changer for my
workflow. The real power comes from combining multiple tools
together - having Brave Search and Tavily Search cross-reference each
other, using Jina.ai Reader to parse documentation, and leveraging
sequential thinking to put it all together. It's like having a
super-powered development environment that can adapt and grow with
you.

If you're interested in trying this out yourself, start small - maybe
just one or two tools to begin with. The MCP ecosystem is growing
quickly, and there's likely a tool out there that fits your specific
needs. The beauty of these tools is that they're not just about AI -
they're about augmenting your development workflow in a way that makes
sense for you.

Remember, the goal isn't to replace your existing workflow but to
enhance it. Whether you're working with Svelte, React, or any other
framework, having these tools in your back pocket can help you stay on
top of changes and write better code.
