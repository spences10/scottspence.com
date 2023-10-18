---
date: 2023-10-16
title: Making a robots.txt syntax highlighter for VS Code
tags: ['reference', 'vscode', 'extension', 'robots.txt']
isPrivate: true
---

<script>
  import { DateDistance as DD } from '$lib/components'
</script>

I was asking ChatGPT to read some posts from my site and summarise
them for me, I was a bit surprised when I got the response **"I wasn't
able to directly access the URL you provided due to restrictions on
the webpage."** from the bot. It was then that I recalled that I'd
blocked ChatGPT in the `robots.txt` file on my site. 😅

I've had all sorts of stuff added to that file over the years, and to
be honest, this is the only time I've known for sure that it works! 😂

Anyway, real quick, if you don't want ChatGPT crawling your site, add
this to your `robots.txt` file:

```text
# Specific directives for GPTBot
User-agent: GPTBot
Disallow: /
```

So, that's fine, right, but I wanted to add some syntax highlighting
to the file in VS Code. I had a quick look on the marketplace, and
there's nothing there that did that one thing, so, I made one. 😁

Yes, this is a post about me making a my `robots.txt` file look nice
in my editor, and the way I went about it.

## I have previous!

If you check out my [publisher profile] on the Visual Studio
Marketplace you'll see that I have done this sort of thing before. Not
for a while though!

So, <DD date="2017-02-27" /> ago was the last time I made a VS Code
extension, and I've not done anything similar since.

This is serving as a record for future me on the things I did and
helpful to anyone else doing something similar.

## Install dependencies

So there's the `yo` ([yeoman.io](https://yeoman.io/)) which is a
scaffolding tool that essentially generates the files and folders,
then there's the `generator-code` specifically for generating VS Code
extensions.

```bash
pnpm install -g yo generator-code
```

In summary, `yo` is the tool that manages the scaffolding process, and
`generator-code` is the specific template for scaffolding out VS Code
extensions.

With them installed I can now generate the extension.

## Generate the extension

Put the two together installed dependencies together an you get
`yo code` which will ask you a bunch of questions about the extension
I just went through these as a best guess, I can change them later if
needed.

```bash
yo code

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `
```

Rather than leave the output from the generator in the text output
I'll add the questions to a list here:

- **? What type of extension do you want to create?**
  - I picked **New Language Support**
- **Enter the URL (http, https) or the file path of the tmLanguage
  grammar or press ENTER to start with a new grammar**.
  - I left this empty, but later it was auto generated [and pointed
    here].
- **? URL or file to import, or none for new:**
  - Left empty
- **? What's the name of your extension?**
  - robots.txt syntax highlighting
- **? What's the identifier of your extension?**
  - robots-txt-syntax-highlighting
- **? What's the description of your extension?**
  - Syntax highlighting for robots.txt files
- **? Language id:**
  - robots-txt, this means that that language can be selected in VS
    Code
- **? Language name:**
  - robots.txt
- **? File extensions:**
  - .txt
- **? Scope names:**
  - Left empty
- **? Initialize a git repository?**
  - Yes

Now, that was a lot of scary and confusing questions! 😅 I've created
a `robots-txt` language? Well, yeah, but only for use in the
extension.

No the project is made for me and I can open it in VS Code.

The project structure looks like this:

```text
├── .vscode
│   └── launch.json
├── syntaxes
│   └── robots-txt.tmLanguage.json
├── .gitattributes
├── .gitignore
├── .vscodeignore
├── CHANGELOG.md
├── language-configuration.json
├── package.json
├── README.md
└── vsc-extension-quickstart.md
```

## Project structure

I'll go through each file and my understanding of what it does.

**`.vscode/launch.json`**

```json
// A launch configuration that launches the extension inside a new window
// Use IntelliSense to learn about possible attributes.
// Hover to view descriptions of existing attributes.
// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
    }
  ]
}
```

This is the configuration for launching the extension in a new window
so I can test out the extension is working as expected, I can hit F5
to launch the extension in a new window.

**`syntaxes/robots-txt.tmLanguage.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "robots.txt",
  "patterns": [
    {
      "include": "#keywords"
    },
    {
      "include": "#strings"
    }
  ],
  "repository": {
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.robots-txt",
          "match": "\\b(if|while|for|return)\\b"
        }
      ]
    },
    "strings": {
      "name": "string.quoted.double.robots-txt",
      "begin": "\"",
      "end": "\"",
      "patterns": [
        {
          "name": "constant.character.escape.robots-txt",
          "match": "\\\\."
        }
      ]
    }
  },
  "scopeName": ""
}
```

This is the grammar for the language, I'll be wanting to match things
in the `patterns` section that are specific to a `robots.txt` file.

**`language-configuration.json`**

```json
{
  "comments": {
    // symbol used for single line comment. Remove this entry if your language does not support line comments
    "lineComment": "//",
    // symbols used for start and end a block comment. Remove this entry if your language does not support block comments
    "blockComment": ["/*", "*/"]
  },
  // symbols used as brackets
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  // symbols that are auto closed when typing
  "autoClosingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""],
    ["'", "'"]
  ],
  // symbols that can be used to surround a selection
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""],
    ["'", "'"]
  ]
}
```

This is the configuration for the language, as there's not much to the
`robots.txt` language the majority of this will be stripped out.

## Add the grammar

```json
{
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "robots.txt",
  "patterns": [
    {
      "match": "^(User-agent|Disallow|Allow|Sitemap|Host):",
      "name": "keyword.control.robots-txt"
    },
    {
      "match": ":.*",
      "name": "string.unquoted.robots-txt"
    },
    {
      "match": "#.*",
      "name": "comment.line.number-sign.robots-txt"
    }
  ],
  "scopeName": "source.robots-txt"
}
```

## Add the language configuration

```json
{
  "comments": {
    "lineComment": "#"
  },
  "brackets": [],
  "autoClosingPairs": [],
  "surroundingPairs": []
}
```

## Package the extension

```bash
pnpm i -g @vscode/vsce
```

```bash
vsce package
```

This will create a file called
`robots-txt-syntax-highlighting-0.0.1.vsix`

## Test the extension

## Publish the extension

```bash
vsce package
vsce publish
```

## Notes

I struggled to find how to generate a token after not doing anything
with this project for well over a year:

To get to your token creation, go here:

- https://YOUR_USER_NAME.visualstudio.com/_details/security/tokens

**Create a token:**

- Name: vsce
- Organisation: All accessible organizations
- show all scopes, select:
  - Marketplace
    - Check Acquire and Manage

**Publish with CLI:**

```bash
# login
vsce login <publisher name>
# use the token created in earlier step
vsce package
# bump version
vsce publish minor # | major | patch
# vsce publish major, minor or patch
vsce publish -p <add created token here>
```

If you get `ERROR Failed request: (401)` see here:

- https://github.com/Microsoft/vscode-vsce/issues/11

Some good documentation on publishing with the CLI:

- https://code.visualstudio.com/api/working-with-extensions/publishing-extension

<!-- Links -->

[and pointed here]:
  https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json
[publisher profile]:
  https://marketplace.visualstudio.com/publishers/spences10
