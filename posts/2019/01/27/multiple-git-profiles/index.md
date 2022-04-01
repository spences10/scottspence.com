---
date: 2019-01-27
title: Setting up multiple Git providers
tags: ['learning', 'guide', 'wsl', 'git']
isPrivate: false
---

Over the past couple of weeks now I have set up several development
machines at work and have had to also use two git accounts, GitHib and
Bitbucket.

To connect to both I use SSH as a preference, I have been using SSH in
place of HTTPS for quite some time now, if you want to connect
repeatedly without having to provide user name and password details
then SSH is a good option.

If you are unfamiliar with using SSH to authenticate with git then
take a look at my cheat sheets repository ([ss10.me/cheat-sheets])
there are several sections covering SSH, notably:

- [How to Authenticate with GitHub Using SSH]
- [Use multiple SSH Keys] (what this post is covering)
- [Re Use SSH Keys from one Machine to Another]

I have come across this set-up a few times now and implemented it for
myself.

You'll need to create a `config` file in the `.ssh` folder in your
home directory (Windows, Ubuntu or both if you use a [WSL set-up])
check with:

```bash
ll ~/.ssh/
```

This will list out the contents of the folder, if you get
`No such file or directory` then you don't have SSH configured.

Take a look at the [How to Authenticate with GitHub Using SSH] section
on the cheat-sheets repo for details on that.

For this example let's presume that we have already created our SSH
keys for Bitbucket and GitHub and authenticated with both Bitbucket
and GitHub.

Next create a `config` file:

```bash
nano ~/.ssh/config
```

This will open a new file with nano that we can add the following to:

```bash
# Bitbucket (default)
  Host bb
  HostName bitbucket.org
  User git
  IdentityFile ~/.ssh/id_default

# GitHub (secondary)
  Host gh
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_secondary
```

Just remember that the `IdentityFile` needs to match what you have
called your SSH keys.

Check current permissions with `stat`:

```bash
# stat -c "%a %n" ~/.ssh/*
644 /home/scott/.ssh/config
700 /home/scott/.ssh/id_default
700 /home/scott/.ssh/id_default.pub
700 /home/scott/.ssh/id_secondary
700 /home/scott/.ssh/id_secondary.pub
```

Change the `config` file permissions as needed:

```bash
chmod 644 ~/.ssh/config
```

## Multiple users

Ok now we should be able to push and pull to the respective GitHub and
Bitbucket repositories, _but_ unless you have the same username and
email address for GitHub and Bitbucket then we're also going to need
to specify specific user details for the repositories we're accessing,
otherwise the details specified in the `~/.gitconfig` are what will be
used with commits.

In my case for work my default user account is Bitbucket so that is
what I have specified in the `~/.gitconfig`, however for the GitHub
repos I work on I'll need to specify my GitHub credentials on a repo
by repo basis.

Historically I have gone into the individual repo and manually set the
config details.

```bash
# from the root of the repo you want to specify the credentials
git config user.name 'Your Name'
git config user.email 'your@email.com'
```

I have since found an ok solution here:
https://stackoverflow.com/a/43654115/1138354

Example:

Global config `~/.gitconfig`

```bash

[user]
  name = play.user
  email = play.user@gmail.com

[includeIf "gitdir:~/work/"]
  path = ~/work/.gitconfig
```

Work specific config `~/work/.gitconfig`

```bash
[user]
  name = work.user
  email = work.user@megacorp.ltd
```

<!-- Links -->

[ss10.me/cheat-sheets]: https://github.com/spences10/cheat-sheets
[how to authenticate with github using ssh]:
  https://cheatsheets.xyz/git/#how-to-authenticate-with-github-using-ssh
[use multiple ssh keys]:
  https://cheatsheets.xyz/git/#use-multiple-ssh-keys
[re use ssh keys from one machine to another]:
  https://cheatsheets.xyz/git/#re-use-ssh-keys-from-one-machine-to-another
[wsl set-up]: https://scottspence.com/posts/wsl-bootstrap-2019/
