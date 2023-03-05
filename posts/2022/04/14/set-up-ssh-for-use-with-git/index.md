---
date: 2022-04-14
title: Set up SSH for use with Git
tags: ['git', 'ssh', 'how-to']
isPrivate: false
---

Secure Shell (SSH) is a secure way to connect with code repository
hosts like GitLab, Bitbucket and of course GitHub. While HTTPS
connections require a username and password credentials, SSH instead
uses a pair of cryptographically generated keys.

The two keys are public and private, the public key is the one that
can be stored on the code repository/hosting provider (GitHub, GitLab,
and the like) and the private one stays secure on my machine.

## Get SSH set up on my machine and add a key to GitHub

I'll first check that there are no `rsa` files here before continuing,
use with the following bash command:

```bash
ls -al ~/.ssh
```

If there's nothing there then I generate a new keygen with:

```bash
ssh-keygen -t rsa -b 4096 -C your@email.com # add your email address 👍
```

The options here, `-t` is the type `rsa`, `-b` is for the bits being
used in this case `4096` and `-C` is a comment to tie my email address
to the key.

I'll then be prompted to give a passphrase for the key, in this case
I'll leave it blank, fi you're following along and want to add a
passphrase then check out the
[SSH keys with passwords](#ssh-keys-with-passwords) section.

I'll add the SSH key to the SSH agent with:

```bash
# for mac and Linux from bash, also from Windows Git Bash
eval "$(ssh-agent -s)"
# for Git Bash on Windows
eval `ssh-agent -s`
# fir Fish shell
eval (ssh-agent -c)
```

Then add the RSA key to SSH with:

```bash
ssh-add ~/.ssh/id_rsa
```

Copy my key to clipboard with one of the following:

```bash
clip < ~/.ssh/id_rsa.pub # Windows
cat ~/.ssh/id_rsa.pub # Linux
pbcopy < ~/.ssh/id_github.pub # Mac
```

<!-- cSpell:ignore pbcopy -->

I'm using Linux so I'll `cat` out the key and copy that then add the
SSH key to my GitHub profile from the [settings] page by clicking the
[New SSH key] button and paste in my key. Save it...

## If I already have projects on my machine that use HTTPS for authentication?

Say I already have projects on my machine and I have decided to use
SSH in place of HTTPS connections with Git there there's a few things
I'll need to do to my existing projects that use HTTPS for
authentication.

On the GitHub repository for the project I'll pick the **Clone with
SSH** option from the **Clone or download** section on the page.

Once I have taken the link from there I'll need to set the repo remote
to the SSH URL.

I can use the Git remote verbose command (`git remote -v`) it will
list the origin, something like this:

```bash
git remote -v
origin  https://github.com/username/repo-name-here.git (fetch)
origin  https://github.com/username/repo-name-here.git (push)
# if the repo is a fork it will show (remote) too
```

I can now set the new origin URL with this command:

```bash
git remote set-url origin git@github.com:username/repo-name-here.git
```

Where username is the `username` of the repo owner and
`repo-name-here` is the name of that user's repository.

## How to authenticate with GitHub using SSH

Once the public key has been added to GitHub I can authenticate with:

```bash
ssh -T git@github.com
```

That's it! I can now start using SSH and not have to authenticate each
time I want to push a commit to GitHub!

## SSH keys with passwords

If you add a password to your SSH key you will find yourself entering
the password to authenticate on each [pull, push] operation. This can
get tedious, especially if you have a long password in your keys.

Add the following line to your `~/.ssh/config/` file:

```bash
AddKeysToAgent yes
```

Open or create the `~/.ssh/config` file with:

```bash
nano ~/.ssh/config
```

The SSH agent will also need to be started on each terminal session
now to store the keys in, add the following to your `~/.bashrc` file:

```bash
[ -z "$SSH_AUTH_SOCK" ] && eval "$(ssh-agent -s)"
```

Open the `~/.bashrc` file with:

```bash
nano ~/.bashrc
```

Now the SSH agent will start on each terminal session and you will
only be prompted for the password on the first `pull`,`push`
operation.

## Permissions issues?

There may be some permissions issues, I have generally found that
setting the following permissions to the files and folders usually
helps:

```bash
# change to the .ssh/ folder
.ssh/
# set permission
sudo chmod 600 id_rsa
# change out to set the folder permissions
../
sudo chmod 700 .ssh/
# authenticate with GitHub
ssh -T git@github.com
```

<!-- Links -->

[settings]: https://github.com/settings/keys
[new ssh key]: https://github.com/settings/ssh/new
