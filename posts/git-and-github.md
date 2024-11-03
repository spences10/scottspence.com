---
date: 2017-01-05
title: Git and GitHub
tags: ['learning', 'guide']
isPrivate: false
---

I know why Linus called it that now!

If you're reading this there's a good chance you know at least the
basics of Git but if like me and you are the only person making
changes to your repos then there's a good chance that you just use
`git push origin master` to move your changes from your local machine
to GitHub, this is not best practice.

<!-- cSpell:ignore octocat -->

![octocat]

What if it's not your repository you want to make changes to? You'll
need to create a pull request, where you make a copy (fork) of the
repo, make the changes to your copy (fork) then request that the owner
of the original repo pulls your changes into their repo. All super
straight forward, right?

As an example I'm going to document my change to the
[awesome-twitter-bots] repo that [@amanhimself] asked me to contribute
to after I made a Twitter bot with his guides.

## Step 1:

I will need to fork the repository on GitHub so I can make my changes.

![fork-a-repo]

Then clone my forked repository to where I'm all going to make the
changes on my computer:

```bash
git clone https://github.com/spences10/awesome-twitter-bots
```

Connect the fork to the Original Repository:

```bash
git remote add upstream https://github.com/amandeepmittal/awesome-twitter-bots
```

## Step 2:

Use `git status` to check what branch you are currently on.

Make a (my) branch:

I'm adding the [Twitter bot] I made so I'm going to give my branch the
same name as my repo

```bash
git branch spences10-twitter-bot
```

Now change to that branch with:

```bash
git checkout spences10-twitter-bot
```

It should say you have switched to the branch but you can check with
`git status`

Add your files **_note_** if you are adding a folder (like I am) just
using `git add .` will add the folder as a file (which I learned from
bitter experience), what you will need to do is:

```bash
git add spences10-twitter-bot/\\*
```

This will add the folder and all its contents, I would post my
terminal 'output of shame' here as it would take up the whole screen.
So now I have added the folder I need to commit to my local repo with:

```bash
git commit -m 'initial commit'
```

I get the terminal output confirming my files are added, then I
`git push` to my branch I checked out earlier:

```bash
git push origin spences10-twitter-bot
```

A quick check of the repo on GitHub confirms that the files are there
I'm now ready to add a contributor [@amandeepmittal] via the
[/settings/collaboration] section of my repo. I can then copy the
invite link and send to Aman, I'm sure he'll be thrilled to see it!

## Step 3:

Visit Aman's repo and GitHub will have detected that I have pushed a
branch to a fork, from here I can click on the 'Compare & pull
request' button.

In the 'Open a pull request' page I'll need to select the my fork and
then my branch, so `spences10\awesome-twitter-bots` and my branch
which is `spences10-twitter-bot` click the 'Create pull request'
button.

![open-a-pull-request]

The rest is up to the repository owner (Aman) now where he can chose
to merge my changes into his repo.

---

## That's not the end though

It turned out that Aman just wanted me to update the [README.md] on
the repo so my pull request was cancelled :flushed:

This was good though because I had the opportunity to go through the
whole thing again, thus getting more familiar with the process, after
making my changes to my fork it was another pull request (PR) which
was then successfully merged as PR [#2]

## Resources

A great resource for me was [Git-It]

And obviously the [GitHub Help] documentation.

## 2fa

Another thing to note is if you're using two factor authentication
you'll need to add your auth token in as a `remote set-url` so you can
push/pull without having to authenticate each time.

`git remote set-url origin https://yourgithubuser:your-token@github.com/yourgithubuser/yourrepo.git`

<!-- Links -->

[awesome-twitter-bots]:
	https://github.com/spences10/awesome-twitter-bots
[@amanhimself]: https://twitter.com/amanhimself
[twitter bot]: https://scottspence.com/posts/twitter-mctwitbot
[git-it]: https://jlord.us/git-it/index.html
[github help]: https://help.github.com/
[@amandeepmittal]: https://github.com/amandeepmittal
[/settings/collaboration]:
	https://github.com/spences10/awesome-twitter-bots/settings/collaboration
[readme.md]:
	https://github.com/amandeepmittal/awesome-twitter-bots/blob/master/README.md
[#2]: https://github.com/amandeepmittal/awesome-twitter-bots/pull/2

<!-- Images -->

[octocat]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930928/scottspence.com/git-logo-536686b63ad7e966fc425ed4c67c2ddc.jpg
[fork-a-repo]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930928/scottspence.com/fork-a-repo-7898cedb809d19d597af446ca0683bd8.png
[open-a-pull-request]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614930930/scottspence.com/open-a-pull-request-3344c43215debf994772b5f1893bc581.png
