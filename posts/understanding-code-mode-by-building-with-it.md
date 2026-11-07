---
date: 2026-11-07
title: 'Understanding Code Mode by building with it'
tags: ['pi', 'mcp', 'coding-agents', 'developer-experience']
is_private: false
---

<script>
	import { Bluesky } from 'sveltekit-embed';
</script>

<!-- cspell:ignore Manufact nlvjelw pddq qoglleko mzby mzbztmtenc mzkolnkmyc Sunil callscript codemode -->

I think I first heard about Code Mode from Luigi (Manufact) in passing
in a conversation around Febraury this year. Then I saw it in use in
Pi and my-pi by proxy then again on The Next Token podcast (this week)
about it's 1 year anniversary. I've been sleeping on it since then! I
started tinkering with it after seeinig it in my-pi, my understanding,
give the agent the tools it can use and let it write JavaScript that
calls those tools which returns only what it needs. Context management
done right.

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3mzby7lh7z22i"
	theme="system"
/>

I was doing work in my-pi and watching the agent use it. It would
write some code, call tools through it, and come back with the result.
So I started asking questions. What was happening in there? How was
that different from the tool calls I was used to seeing? And what did
it mean for the stuff I'd already built?

## I was thinking about the output

I'd already built a
[SQLite context sidecar for my-pi](/posts/sqlite-context-sidecar-my-pi)
to keep large tool results out of the model's context. Store the
output, give the agent a receipt, let it retrieve the relevant parts.

Code Mode approached that problem earlier. If a tool returns a large
collection of records and I only need a count, the script can count
them. There's no reason for the model to read every record.

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3mzbztmtenc2i"
	theme="system"
/>

I even found that my sidecar was getting in the way. It intercepted
large results inside Code Mode before the script could process them. I
had to change my integration so the script received the data intact,
with the sidecar handling oversized output that actually reached the
conversation.

That helped me understand where the processing happened. But I was
still mostly thinking about how much text came back, rather than the
fact that the model was writing the procedure in the first place.

## The tools are defined. The procedure doesn't have to be

Coincidentally I also listened to
[What's after Code Mode on The Next Token](https://www.youtube.com/watch?v=0hRlvn0IPMI).
They were talking about it being around a year since the original
Cloudflare post. I'd gone from hearing the name in passing eight
months ago to seeing my harness using it and messing around with it
myself to improve other tools for my tools to use in a matter of days.

This make me think about this post a lot now!

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3mho7hi46kc2y"
	theme="system"
/>

The example with Jev stuck with me though. Give the agent a
classification tool and a task, and it writes the questions and the
code to use it. The model decides the categories, not just which
predefined workflow to run.

So I started poking at
[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch). Could I
use Code Mode there instead of maintaining all those provider
adapters?

I ended up rewriting it around discoverable, schema-generated
functions for the providers' native APIs. The agent can find what it
needs and write the code to call them. I still expose the interfaces,
but I don't have to write every combination of calls myself.

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3mzkolnkmyc2z"
	theme="system"
/>

## Why I can't leave this alone

I've already been building something along these lines with Svortie.
You give it a description of what you want done, it generates a
workflow, and sends that to a sandbox to execute. That's what I made
it for. So the idea of the model constructing the workflow isn't new
to me. What caught my attention was what I could give that workflow
access to.

Jev is a classifier. Give it content and questions, and it returns
choices, scores or probabilities. Rather than asking a reasoning model
to work through every item itself, the generated code can call Jev
where it needs a classification.

But I don't want to write one tightly defined classification workflow
with categories I've already picked. I want to describe the task and
let the agent decide what questions to ask, what categories make
sense, and write the code around those calls. Code Mode gives it
somewhere to put that together using the tools I've exposed.

Then there's equipment. That's what I call code an agent writes once
and can reuse on later runs in Svortie. If it puts together a useful
procedure, I don't want it figuring out the same thing from scratch
every time. It could run the saved code, still calling Jev wherever
the task needs classification.

That's the connection I keep coming back to. Svortie already turns a
description into something it can run. I'm exploring how Code Mode,
classification and equipment fit into that, so the agent can construct
what the task needs and keep the parts that are worth using again.

## References

- [The Next Token: What's after Code Mode](https://www.youtube.com/watch?v=0hRlvn0IPMI),
  including the
  [dynamic Jev classification example at 31:56](https://www.youtube.com/watch?v=0hRlvn0IPMI&t=1916s).
- [Sunil Pai: Code Mode, Let the Code do the Talking](https://www.youtube.com/watch?v=8txf05vVVl4).
- [Cloudflare: Code Mode, the better way to use MCP](https://blog.cloudflare.com/code-mode/).
- [CodeAct: Your LLM Agent Acts Better when Generating Code](https://machinelearning.apple.com/research/codeact).
- [Cloudflare: Code Mode, give agents an entire API in 1,000 tokens](https://blog.cloudflare.com/code-mode-mcp/).
- [QuickJS JavaScript Engine](https://bellard.org/quickjs/).
- [Cloudflare: Your agent needs a computer, not a container](https://blog.cloudflare.com/cloudflare-computer).
- [Vercel: Introducing Run SDK](https://vercel.com/blog/introducing-run).
- [Vercel Labs: callscript](https://github.com/vercel-labs/callscript).
- [Pi's standalone Code Mode package](https://github.com/earendil-works/pi/tree/main/packages/codemode).
- [The node:vm executor in codemode-x](https://github.com/codelitt/codemode-x/blob/main/src/executor.ts).
- [Node.js documentation for node:vm](https://nodejs.org/api/vm.html),
  including its warning that the module is not a security mechanism.
