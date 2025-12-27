---
date: 2016-11-14
title: VBA Code Export for Version Control Systems
tags: ['vcs', 'vba']
is_private: false
---

I have seen the same situation many times now in my career as a VBA
Developer about how source code control is managed with VBA projects.

Source control on VBA has long been a bit of a nonsense, there isn't
any really. When I started my first developer role it was talked about
in my team why we don't use it and the best efforts the team did at
the time was save the new version to a different folder location and
to compare changes in the code from a previous version meant getting a
text compare app copy pasting the code into it from the two different
versions so you could track what was changed.

My colleague at the time and now very good friend
[Paul Crook](https://uk.linkedin.com/in/paul-crook-4065a461) came up
with the base of what I have done with the
[VBA IDE Code Export tool](https://github.com/spences10/VBA-IDE-Code-Export)
I have just extended some parts of his base that I feel were needed.

What was lacking from Crookie's code, which I brought up at the time
with him was that it only exported `*.bas`, `*.cls` and `*.frm` files
I did ask about code contained within the `ThisWorkbook` and the
`Sheet*` modules. What we decided to do was if there was code in those
modules was to abstract it out into its own module, so `ThisWorkbook`
would call out to `ThisWorkbook.bas` this was a bit of extra work to
begin with but ultimately benefited us in the long run with good
version control.

I wasn't keen on how you had to work with this so decided to have a
play around with it when I put it on
[GitHub](https://github.com/spences10/VBA-IDE-Code-Export) I decided
to try right some of that, I think I may have made some things worse
but I'm keen to make another revision of the tool in the future to
correct that.

### what did you make better

- added functionality to save code from `ThisWorkbook` and `Sheet*`
- made a `.conf` file to save the project contents to meaning there
  were no modules left in the project after export
- added the ability to specify an import and export location, it was
  defaulted to the root of where the source workbook was located

### what did you mess up

- added a form, means more validation
- added ranges to the configuration worksheet for storing locations
  other than the `ThisWorkbook` file location
- didn't add the new functionality to the existing code

### up next

- possibly remove the old method that copied out the project contents
  to a module and go full retard with the `.conf` file
