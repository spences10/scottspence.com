---
date: 2022-04-14
title: Git Use SSH in place of HTTPS
tags: ['git', 'how-to']
isPrivate: true
---

Get your SSH set up on your machine and add a key to GitHub, more on
that here:
https://egghead.io/lessons/javascript-how-to-authenticate-with-github-using-ssh

You will then need to pick your **Clone with SSH** option from the
**Clone or download** section on your repo page.

Once you have taken the link from there you will need to set the repo
remote to the SSH URL

```bash
git remote set-url origin git@github.com:username/repo-name-here.git
```

Where username is the `username` of the repo owner and
`repo-name-here` is the name of that user's repository.

## How to authenticate with GitHub using SSH

Check that there are no `rsa` files here before continuing, use (bash
or Git bash if you're on Windows):

```bash
ls -al ~/.ssh
```

If there's nothing there then generate a new keygen with:

```bash
ssh-keygen -t rsa -b 4096 -C your@email.com # add your email address 👍
```

> If you decide to use a password for your SSH key see
> [SSH Keys With Passwords](#ssh-keys-with-passwords) Now using
> `ls -al ~/.ssh` will show our `id_rsa.pub` file.

Add the SSH key to the SSH agent:

```bash
# for mac and Linux from bash, also from Windows Git Bash
eval "$(ssh-agent -s)"
# for Git Bash on Windows
eval `ssh-agent -s`
# fir Fish shell
eval (ssh-agent -c)
```

Add RSA key to SSH with:

```bash
ssh-add ~/.ssh/id_rsa
```

Copy your key to clipboard with one of the following:

```bash
clip < ~/.ssh/id_rsa.pub # Windows
cat ~/.ssh/id_rsa.pub # Linux
pbcopy < ~/.ssh/id_github.pub # Mac
```

Add a new SSH Key to your GitHub profile from the [settings] page by
clicking the [New SSH key] button and paste in your key. Save it...

[settings]: https://github.com/settings/keys
[new ssh key]: https://github.com/settings/ssh/new

Then authenticate with:

```bash
ssh -T git@github.com
```

If you go back to the GitHub setting page and refresh the key icon
should go from black to green. 🎉
