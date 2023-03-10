---
date: 2020-05-09
title: VS Code Tips and Snippets
tags: ['learning', 'guide', 'vscode']
isPrivate: false
---

Use the same frontmatter block all the time for your blog posts?

I do, so I've created a VS Code snippet to pre-populate the block with
some default tags and today's date.

To create it I opened my global VS Code snippets file, `Ctrl+Shift+p`
then search `snippets` and select "Preferences: Configure User
Snippets" I have all my snippets in a global file.

```json
"frontmatterBlock": {
  "prefix": "fmb",
  "body": [
    "---",
    "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE",
    "title: $1",
    "tags: ['information', 'learning', 'guide']",
    "private: true",
    "---"
  ],
  "description": "frontmatter block for frontmattering"
},
```

I've named the property `frontmatterBlock` with the prefix of "fmb"
this is what I'll type into VS Code to activate the VS Code
intellisense then tab to complete the operation.

The `$1` is where the cursor goes to when the snippet is added, you
can place these where you want to tab to once the snippet has been
added.

So, if I wanted to not have the default tags that are currently there
I can replace them like this:

```json {7}
"frontmatterBlock": {
  "prefix": "fmb",
  "body": [
    "---",
    "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE",
    "title: $1",
    "tags: ['$2', '$3', '$4']",
    "private: true",
    "---"
  ],
  "description": "frontmatter block for frontmattering"
},
```

Now after tab completing the snippet I can tab through those sections
in the snippet to add the details.
