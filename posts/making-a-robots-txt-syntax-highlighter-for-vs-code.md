---
date: 2023-10-23
title: Making a robots.txt syntax highlighter for VS Code
tags: ['reference', 'guide', 'vscode', 'extension', 'robots.txt']
isPrivate: false
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

So there's `yo` ([yeoman.io](https://yeoman.io)) which is a
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

Now the project is made for me and I can open it in VS Code.

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

I left it as is.

**`syntaxes/robots-txt.tmLanguage.json`**

This is the grammar for the language, I'll be wanting to match things
in the `patterns` section that are specific to a `robots.txt` file.

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

This got switched out with this:

```json
{
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "robots.txt",
  "fileTypes": ["txt"],
  "firstLineMatch": "^User-agent:",
  "patterns": [
    {
      "match": "^(User-agent|Disallow|Allow|Sitemap|Host):(\\s*)(.*)",
      "captures": {
        "1": {
          "name": "keyword.control.robots-txt"
        },
        "3": {
          "name": "string.unquoted.robots-txt"
        }
      }
    },
    {
      "match": "#.*",
      "name": "comment.line.number-sign.robots-txt"
    }
  ],
  "scopeName": "source.robots-txt"
}
```

The `match` pattern is updated to capture three distinct groups:

1. The keyword (`User-agent`, `Disallow`, `Allow`, `Sitemap`, `Host`)
1. Any whitespace characters (`\\s\*`)
1. The remainder of the line (`.\*`)

As I don't want to capture the whitespace, I've not assigned it a
scope. (i.e. that's why it goes from 1 to 3)

So, using the captures property, I can then assign different scopes to
each captured group. Group `1` is assigned the
`keyword.control.robots-txt` scope, and group `3` is assigned the
`string.unquoted.robots-txt` scope.

**`language-configuration.json`**

This is the configuration for the language, as there's not much to the
`robots.txt` language the majority of this will be stripped out.

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

Here's what I replaced it with:

```json
{
  "comments": {
    "lineComment": "#"
  },
  "brackets": [],
  "autoClosingPairs": [],
  "surroundingPairs": [],
  "folding": {
    "markers": {
      "start": "^User-agent:",
      "end": "^\\s*$"
    }
  },
  "indentationRules": {
    "increaseIndentPattern": "^User-agent:",
    "decreaseIndentPattern": "^\\s*$"
  }
}
```

I added in the `folding` and `indentationRules` properties to enable
folding and indentation and added the `lineComment` property to
specify the comment character.

## Install VSCE

I'll need to install the [Visual Studio Code Extension Manager] so I
can package and publish the extension.

```bash
pnpm i -g @vscode/vsce
```

## Package the extension

Now I can package and publish the extension.

I'll set the package version with `npm`

```bash
npm version patch # major 1.0.0 | minor 0.1.0 | patch 0.0.1
```

This will increment the version in `package.json` and create a git
tag.

Once I'm done I can push the tag to GitHub:

```bash
git push --tags
```

Then I can package the extension:

```bash
vsce package
```

This will create a file called `robots-txt-0.0.1.vsix` this is what's
going to go to the marketplace.

## Test the extension

I can test the extension by hitting F5 in the project that will bring
up the extension in a sandboxed environment where I can check the
highlighting is to my expectation.

## Publish the extension

Now I'm happy with the extension I can publish it to the marketplace.

```bash
vsce publish
```

Now I get a prompt for a personal access token:

```bash
vsce publish
 WARNING  Failed to open credential store. Falling back to storing secrets clear-text in: /home/scott/.vsce
https://marketplace.visualstudio.com/manage/publishers/
Personal Access Token for publisher 'spences10':
```

I already have a marketplace account so, I'll need to create that
token now!

## Create a personal access token

To get my access token created, I'll go here:
https://spences10.visualstudio.com/_details/security/tokens

> Change your username if your doing this yourself.

I'll navigate through [the notes on working with extensions] on the VS
Code documentation to create the token. The steps are:

- Name: whatever (I'll set the token to expire a day later)
- Organisation: my organisation (or whatever yours is)
- Scopes: Custom defined
- Click show all scopes, select:
  - Marketplace
    - Check Acquire and Manage
- Create

Copypasta the token into the prompt and hit enter.

Done! 🎉

## Conclusion

In a nice little tangent, I set about a minor yet intriguing project
to beautify the `robots.txt` file in my VS Code editor.

This serves as a note to future Scott but, I hope you found it useful
too! 💫

<!-- Links -->

[and pointed here]:
  https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json
[publisher profile]:
  https://marketplace.visualstudio.com/publishers/spences10
[Visual Studio Code Extension Manager]:
  https://github.com/microsoft/vscode-vsce
[the notes on working with extensions]:
  https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
