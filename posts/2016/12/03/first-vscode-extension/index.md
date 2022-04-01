---
date: 2016-12-03
title: My first Microsoft Visual Studio Code [VS Code] extension
tags: ['learning', 'vscode', 'extension']
isPrivate: false
---

I'm a published developer! [sort of] Well that was a bit painful, well
not actually I mean from the documentation I feel I was a bit mislead.

So for those of you that know what I do for a living I'm primarily an
Analyst Developer with a skill set of VBA and SQL which has put me in
good stead for the last 10+ years. I'm currently 'up-skilling' myself
on more general programming languages, but enough of that! I basically
wanted to use [VS Code][vscode] with VBA which is fine as it's just
text files but I wanted some of the shexy stuff that VS Code comes
with.

![vscode vba market-place]

I'm not going to go into how awesome (I think) VS Code is here but I
will mention that for the purpose of me wanting to use (or at least
see syntax highlighting) I found this extension for
[VBScript][vbscript] which was neat but didn't give me any
intellisense for even the most straight forward stuff like to create a
`Sub` or `Function`.

So that got me playing around with making my own [snippets][snippets]
and I found that after a while I had quite a lot of them so I decided
to put them on the VS Code market place.

So, what I found is that Microsoft really want you to make VS Code
extensions and give you all the tools you need to do so.

I found guides [here][guide1], [here][guide2] and [here][guide3] all
of which have you using [Yeoman](https://yeoman.io/) by installing via
npm, now I've never heard of Yeoman before trying to do this so I
don't have an opinion on that apart from to say it was a bit of a
ballache to get any of it up and running. I tried installing it on
both my home machine and a Cloud9 machine several times over with no
success.

![YeomanErr]

Got tired after uninstalling and reinstalling several times at home
and on the cloud so moved on. I read
[this](https://code.visualstudio.com/docs/tools/vscecli) guide about
setting yourself up as a publisher on the Microsoft VS Code
[Marketplace](https://marketplace.visualstudio.com/) using with `vsce`
(agin installed with npm) so after creating a Personal Access Token
and creating my publisher account I could then publish my extension.
But this was the thing my extension is just the `vbscrip.json` file on
my hard drive.

## How do I make it into a extension?

After reading up on extension I thought that you needed to have your
package 'packaged' with a `.vsix` extension so looking at the links
earlier you need to install Yeoman (bugger!)

I looked around at other snippets packages on GitHub and couldn't
understand why I needed to have my snippets packaged up in this
`.vsix` file, all it was, was the `.json` file from my computer.

So this is what I did, I copied the file structure from one of another
GitHub repositories that were just snippets, it basically consisted of
two folders and a `package.json` file. I replaced all the relevant
properties in the `.json` file and created a
[GitHub](https://github.com/spences10/vba-snippets) repository just
for the sake of having all my lovingly crafted snippets kept safe.

So it looked like I had no way to get this onto the Marketplace, I was
pretty bummed but thought I'd just go though the process of publishing
an extension with `vsce` by cd'ing to the folder the package was in
and going through the commands so I tried `vsce publish 1.0.0`

I was pretty surprised (and relieved) to see the output pictured.

![vscePublish]

I had a quick check of my publisher profile and lo and behold, there's
my extension!

![extension on market place]

Here's my extension:
[VBA Snippets](https://marketplace.visualstudio.com/items?itemName=spences10.vba-snippets)
from there you can fin the
[GitHub](https://github.com/spences10/vba-snippets) repository too, I
hope it comes in handy for you one day!

<!-- Links -->

[vbscript]:
  https://marketplace.visualstudio.com/items?itemName=luggage66.VBScript
[vscode]: https://code.visualstudio.com/
[snippets]:
  https://code.visualstudio.com/Docs/customization/userdefinedsnippets
[guide1]: https://code.visualstudio.com/docs/extensions/overview
[guide2]:
  https://code.visualstudio.com/docs/extensions/example-hello-world
[guide3]:
  https://code.visualstudio.com/docs/extensions/testing-extensions

<!-- Images -->

[vscode vba market-place]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930927/scottspence.com/visual-studio-marketplace-50f58b39bdbe05c6e32a31e989f12802.png
[yeomanerr]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930927/scottspence.com/yeoman-err-0d720ffedb48cce898538fc5510ccb14.png
[vscepublish]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930927/scottspence.com/vsce-publish-4e408c5714752608e16b26532fdddb43.png
[extension on market place]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930930/scottspence.com/marketplace-extensions-management-ed95fb9a535f6a2cfc14a3745830a20a.png
