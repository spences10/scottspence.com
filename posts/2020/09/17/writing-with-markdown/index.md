---
date: 2020-09-17
title: Markdown Showdown - All I Know About Markdown
tags: ['markdown', 'getting-started', 'guide']
isPrivate: false
---

<script>
  import { MarkdownParser, Small } from '$lib/components'
  import { YouTube } from 'sveltekit-embed'
</script>

Here it is kids! All I know about Markdown. First! The standard
preamble...

Before that though! Some of the possible titles I came up with before
writing this:

- Uptown with Markdown
- Downtown with Markdown
- Splashdown with Markdown
- Don't frown with Markdown
- Get the Markdown Crown

Sorry, anyways! Onwards!!

As a developer, a developer of web, and someone that writes a lot in
my [digital garden] I use Markdown on a daily basis, but what is
Markdown?

## Introduction: What's Markdown then?

<YouTube youTubeId="kKAQhz0KxNU" />

Essentially Markdown is a way to format your text, like you would in
Microsoft Word but without using the toolbar to select the format for
the text.

The goal for Markdown is to enable easy to write and easy to read
plain text format that can be converted to HTML in the browser.

There are a many differing flavours of Markdown which you may have
come across before on the web, places like Discord, GitHub, Jira,
Reddit, StackExchange, and even WhatsApp and Facebook all use some
form of Markdown!

If you're intertested you can take a look at the original spec from
John Gruber posted in [December 2004 on Daring Fireball]

I'll be focusing on GitHub Flavoured Markdown Specification ([GFM]) in
this guide.

Like I mentioned earlier Markdown is converted into valid HTML and if
you have not encountered Markdown before it before looks something
like this in your text editor:

```markdown
## This is a h2 headding
```

The equivalent in HTML will be:

```html
<h2>This is a h2 headding</h2>
```

Which will be converted to a h2 as you see in the web browser. Take a
look at this interactive component here 👇 try editing the text on the
left:

<MarkdownParser rows={1} markdownContent="## This is a h2 heading" />

## Markdown Tooling

There are many places to use Markdown as I mentioned earlier, for the
examples here I'll be using the interactive component, if you want to
follow along I'll be using VS Code and Prettier.

There's also [Markdown Forge] by [Justin Juno] which is a very handy
tool for writing Markdown in the browser.

<YouTube youTubeId="vaELw_YJF-M" />

## Paragraphs and Text Decoration

The basics of Markdown is writing text in paragraphs the whole idea is
that it's readable in plain text before it get parsed out to HTML.

<MarkdownParser rows={1} markdownContent="This is a paragraph" />

One little gotcha here is that there needs to be a clear space between
paragraphs otherwise Markdown parses them all as one paragraph as
Markdown needs a line between them to identify them as paragraph
elements, example:

<MarkdownParser rows={2}
markdownContent={`This is a paragraph.\nThis is also a paragraph.`} />

Adding a clear line space between paragraphs allows Markdown to make
the distinction:

<MarkdownParser
markdownContent={`This is a paragraph.\n\nThis is also a paragraph.`}
/>

### Bold

Bold text is achieved by adding double asterisks around the word or
paragraph you want to bold.

<MarkdownParser rows={1} markdownContent={`This is **bold**.`} />

### Italic

Italic or emphasis is done by adding underscores around the word or
paragraph you want to add emphasis to.

<MarkdownParser rows={1} markdownContent={`This is _italic_.`} />

One thing to note in Markdown is that one set of _either_ underscores
or asterisks will make it _italic_ and two sets of **either**
underscores or asterisks will make it **bold**, so both `*italic*` and
`_italic_` will do the same thing as will `**bold**` and `__bold__`.

Luckily for me as a Prettier user this that decision taken away from
me and will format **bold** with asterisks (`**bold**`) and _italic_
with underscores (`_italic_`).

### Strikethrough

The thing to remember with strikethrough is that it's double tilde not
a single one, using a single tilde with show the tilde either side of
the word/paragraph.

<MarkdownParser
markdownContent={`This is ~~strikethrough~~.\n\nThis is not ~strikethrough~.`}
/>

<YouTube youTubeId="iTSFkvJqQlw" />

## Markdown Headings

There are two ways to do headings in Markdown, the first way which you
may see but is way less popular is with `===` and `---`:

<MarkdownParser rows={5}
markdownContent={`Heading 1\n===\n\nHeading 2\n---`} />

This approach will only give you the option of a h1 and a h2 however,
so the next approach (and what you will see a lot more than the
previous example) is to use hashes `#` for going from h1 (single `#`)
all the way to h6 (six `######`)!

<MarkdownParser rows={6}
markdownContent={`# h1 heading\n ## h2 heading\n ### h3 heading\n #### h4 heading\n ##### h5 heading\n ###### h6 heading`}
/>

With this way of doing Markdown headings if you put these in a
`README.md` on GitHub it will automatically add IDs to the heading.

This means you can reference the headings in a table of contents when
there is a particularly large amount of text in the document.

<YouTube youTubeId="Q01cSkVGugI" />

## Markdown Links

To add a link to Markdown, be it external (to another site) or locally
(to a specific heading) there's a few ways to do it.

For a raw link you want displayed you can add it as is, or surround it
with angle brackets.

<MarkdownParser rows={6}
markdownContent={`Raw link: https://scottspence.com/garden\n\nWith angle brackets: <https://scottspence.com/garden>`}
/>

To link text wrap the text you want to link in square brackets with
parenthesis at the end with the link in there:

<MarkdownParser
markdownContent={`Check out my [digital garden](https://scottspence.com/garden) for more content.`}
/>

There is also the option to add a title to the link where hovering the
link will show the title, do this by adding the title in quotes after
the hyperlink.

<MarkdownParser
markdownContent={`Check out my [digital garden](https://scottspence.com/garden 'check it out') for more content.`}
/>

This way of adding links can become a bit disorienting if there are
many links in a document making it hard to read and the whole point of
Markdown is to make the text easier to read.

The approach I like to take is using keys or references:

<Small>
  Right now the component I have for the Markdown rendering doesn't
  support it so I'll be adding these in with no rendered example.
</Small>

```markdown
<!-- This isn't great to read -->

Check out my [digital garden](https://scottspence.com/garden) for more
content.
```

```markdown
<!-- This is nicer -->

Check out my [digital garden][1] for more content.

<!-- Links -->

[1]: https://scottspence.com/garden 'add a title here'
```

```markdown
<!-- This is nicer still -->

Check out my [digital garden] for more content.

<!-- Links -->

[digital garden]: https://scottspence.com/garden 'title here'
```

The several examples there are all valid ways to add links, also
notice that I have added HTML comments (`<!-- -->`) here, these aren't
rendered with the Markdown which makes it handy for identifying types
of links.

### Local link references

Like I mentioned with the headings these can also be linked to
headings in the Markdown document, so to skip to the
[Markdown Images](#markdown-images) section I'd create a link like
this:

```markdown
[Markdown Images](#markdown-images)
```

Notice that the ID matches the ID added to the heading by the Markdown
parser in the HTML, you may need to check this if you have special
characters in the heading, in most cases apostrophes and ampersands
will be stripped out of the generated ID.

As an example if the heading was Markdown & Images the heading would
have the ampersand removed and look like this:

```markdown
[Markdown & Images](#markdown--images)
```

<YouTube youTubeId="Knctg-2vWRo" />

## Markdown Images

Images in Markdown are pretty much the same as links with a subtle
difference, to add an image in Markdown use `![]()` bang (`!`)
indicates it's an image, square brackets (`[]`) are for the alternate
text that shows up for screen readers and search engines and the
parenthesis (`()`) are where the link to the image goes, you can also
add in a tool tip (title) in the same way as with links.

<MarkdownParser
markdownContent={`![alt name for image](https://picsum.photos/200/100 'tool tip to show on hover of image')`}
/>

With images being a lot like links in Markdown the same applies for
using keys and references here:

```markdown
<!-- This isn't great to read -->

![alt name for image](https://picsum.photos/200/100 'tool tip to show on hover of image')
```

```markdown
<!-- This is nicer -->

![alt name for image][1]

<!-- Links -->

[1]: https://picsum.photos/200/100 'tool tip'
```

```markdown
<!-- This is nicer still -->

![alt name for image]

<!-- Links -->

[alt name for image]: https://picsum.photos/200/100 'tool tip'
```

<YouTube youTubeId="7GVSEuif8_o" />

## Markdown Lists

Markdown lists are the same as with HTML, with unordered and ordered
lists. Also like with headings, text decorations and bold and italic
in Markdown there's several ways to make **unordered lists** in
Markdown:

### Unordered list

There's several options which can be mixed and matched depending on
how the list is structured and they can all be used in one list, the
identifiers are asterisks (`*`), hyphens (`-`) and plus (`+`):

<MarkdownParser
markdownContent={`* Using asterisks\n- Using hyphens\n+ Using plus`}
/>

Again Prettier has taken away the decision making for me here and
decided that hyphens are the way to do this for me in my text editor.

### Ordered lists

Ordered lists can use a numbering scheme but it's a lot more
straightforward to use `1.` for all the list items when creating
lists.

Why? Because if there's another item that needs inserting in the
middle of the list all the numbering has to change.

Using the `1.` approach Markdown does all the numbering for you:

<MarkdownParser
markdownContent={`1. Ordered Lists\n1. All use\n1. The same number, 1.`}
/>

### Nesting lists

Indenting the list items will start a nested list, this can be done
indefinitely and the formatting of the bullets will be taken care of
by the Markdown parser.

Nesting lists with a lot of content can get a but funky and it's nice
to have content on more than one line.

To get around this there needs to be a clear line in between the
bullet paragraph and the additional content to go in there:

```markdown
1. List item one

   1. Indented item that needs additional information

      More content here, which will be indented with the bullet.
      ![alt name for image](https://picsum.photos/200/100 'tool tip to show on hover of image')

1. Rest of the ordered list items
```

<YouTube youTubeId="3RMGk8Fymv4" />

### Check Boxes

To add a check box to a list use the list notation (`-`) with square
brackets with either a space between the spaces to indicate an empty
checkbox (`[ ]`) or with an x to indicate that it's checked (`[x]`).

```markdown
- [ ] Check, check one
- [x] Check two
```

The checkbox needs to start with the hyphen, space then the square
brackets indicating if it is checked or not:

<MarkdownParser
markdownContent={`- [ ] Check, check one\n- [x] Check two`} />

<YouTube youTubeId="aqKnADsZkz0" />

## Line Breaks

Because Markdown is converted to HTML for any markup that is not
covered by Markdown's syntax, there is the option to use HTML itself.

In the case of needing several paragraphs close together there's the
option to add in a `<br/>` tag.

```markdown
Line one<br/> Line two<br/> Line three<br/>
```

Will render the following:

Line one<br/> Line two<br/> Line three<br/>

<YouTube youTubeId="hCln_m1vgww" />

## Horizontal Rules

There's several ways to do a horizontal rule in Markdown, with
hyphens, asterisks and underscores.

Like with the text decorations for bold and italic Prettier has
declared that hyphens are the way to do this for me in my text editor
but I'm detailing the differences here.

<MarkdownParser markdownContent={`Hyphens\n\n---`} />

<MarkdownParser markdownContent={`Asterisks\n\n***`} />

<MarkdownParser markdownContent={`Underscores\n\n___`} />

Take note of the clear line between the content and the hyphens, if
there is no clear break between the two then that will render a h1.

<YouTube youTubeId="kaJG1k1X8SQ" />

## Block Quotes

This is regularly used when reply quoting someone on a forum or a
GitHub issue.

Add the `>` to the beginning of the text with a space to create a
blockquote.

The same Markdown formatting applies to the text within it but there
may be limitations on with the Markdown parser being used.

<MarkdownParser
markdownContent={`> Block Quotes Are Cool!\n>\n> **- Yo!**`} />

<YouTube youTubeId="vN1e_zVbCGE" />

## Code Blocks

There are a couple of ways to add code snippets in markdown, the first
is inline with single backticks (`` ` ``) wrapping the code, the other
is with fenced code blocks.

An inline code `` `<h1>Hello world!</h1>` `` adding the backticks will
usually change the font to monospace with some highlighting to
differentiate it from the rest of the content.

An example of the above sentence here:

```markdown
An inline code `<h1>Hello world!</h1>` adding the backticks will
```

Code blocks in Markdown, depending on the parser being used, will
often recognise the language and apply some syntax highlighting.

The code fence helps the parser identify the language being used, a
code fence will start with three backticks then have the language
that's being used, in this example JS:

<MarkdownParser rows={5}
markdownContent={`\`\`\`\js\nconsole.log('hello world!')\n\`\`\`\n`}
/>

GitHub uses [Linguist] to determine the syntax highlighting on issues
and READMEs, there's a lot in there!

Code fences don't have to have a language attached to them and a code
fence with no language assigned will look like this:

<MarkdownParser rows={5} markdownContent={`\`\`\`\nconsole.log('hello
world!')\n\`\`\`\n`} />

<YouTube youTubeId="Hwok0c9V1Fo" />

## Markdown Tables

Markdown tables look fugly! There I said it! If there's content that
needs to go into a table, each one of the columns needs to be
surrounded by a pipe, like so:

```markdown
|col 1|col 2|col3|
```

Then each of the column rows needs to have pipes around the content
too.

```markdown {2}
|col 1|col 2|col3|

|col 1 row 1|col 2 row 1|col 3 row 1|
```

Then for Markdown to know it's a table there needs to be a row of
hyphens surrounded by pipes again, there's some special notation on
the pipes for alignment in the table, here's what the second row looks
like to have all text left aligned:

```markdown
| :------- | :------ | :------ |
```

To have all columns right aligned:

```markdown
| -------: | ------: | ------: |
```

To have all columns centred:

```markdown
| :-------: | :------: | :------: |
```

Notice the colons (`:`), they're how to show which alignment is used
in the table, colon on the left (`| :--- |`), left aligned, colon on
the right (`| ---: |`), right aligned, colon either side `| :---: |`
centred, here's an example table:

| col 1       |    col 2    |        col3 |
| :---------- | :---------: | ----------: |
| col 1 row 1 | col 2 row 1 | col 3 row 1 |
| col 1 row 2 | col 2 row 2 | col 3 row 2 |

The amount of hyphens doesn't matter, as long as there is at least
one. This is where having a formatting tool like Prettier step in to
do the formatting for you is super handy.

If there is more content added to the table and the coresponding
columns aren't formatted to fit it could get a bit tricky to read:

```markdown
| col 1               |    col 2    |                col3 |
| :------------------ | :---------: | ------------------: |
| col 1 row 1 content | col 2 row 1 |         col 3 row 1 |
| col 1 row 2         | col 2 row 2 | col 3 row 2 content |
```

<YouTube youTubeId="x6UQpbkrmus" />

## Resources

- [The initial Markdown announcement]
- [Markdown table generator]
- [Markdown Cheatsheet]
- [Markdown Forge] by [Justin Juno]

<!-- Links -->

[digital garden]: https://scottspence.com/garden
[gfm]: https://github.github.com/gfm/
[markdown table generator]:
  https://www.tablesgenerator.com/markdown_tables
[the initial markdown announcement]:
  https://daringfireball.net/projects/markdown/
[markdown cheatsheet]:
  https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
[markdown forge]: https://www.markdownforge.com/about
[justin juno]: https://twitter.com/justinjunodev
[linguist]:
  https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
[december 2004 on daring fireball]:
  https://daringfireball.net/projects/markdown/
