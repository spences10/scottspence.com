---
date: 2025-01-28
title: Git SSH and Commit Signing Setup in WSL Ubuntu
tags: ['git', 'ssh', 'wsl', 'ubuntu']
is_private: false
---

<script>
  import { Bluesky, YouTube } from 'sveltekit-embed'
  import { Details } from '$lib/components'
</script>

Aight! It happened again! Mysteriously git just straight up stopped
working for pulling/pushing on one of my WSL Ubuntu instances! I've
just gone through setting up a fresh WSL Ubuntu 24.04 install and
wanted to detail the process of getting Git configured with SSH
authentication and commit signing. I'll go through the entire process
of setting this up from scratch.

## 1Password SSH client

"So, what happened yo?" Well, seeing as you asked! I'm not certain but
pretty sure it's 1Password and the SSH client. I was merrily going
round and creating all the SSH keys with the super duper 1Password
integration then one day they stopped working.

This was a while back when I posted this, but, there was a recent
update to 1Password that I installed. So, pretty sus that I can no
longer authenticate with my SSH keys, right?

<!-- cspell:ignore nlvjelw,pddq,qoglleko,3lbraturtf22s,3lbrb7dxsfs24,35bdlgus7hihmup66o265nuy,signingkey,rerere,gpgsign -->

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3lbraturtf22s"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

[David Flanagan](https://rawkode.dev) is the goat when it comes to git
related questions and he always has a good solution! This time, less
is more!

<Bluesky
	post_id="did:plc:35bdlgus7hihmup66o265nuy/app.bsky.feed.post/3lbrb7dxsfs24"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

I'll be doing this progressively, as I go through the various VPS' I
log into I'll be replacing the many SSH keys I've generated with
1Password with the one key to rule them all!

## Prerequisites

I've already got the SSH key I'm going to use here in 1Password, so
this is a copy paste operation of the existing public and private
keys. If you want to get set up with creating a new SSH key, you can
do so with the following command:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

I already have the key added on GitHub as an authentication key and
signing key, you can find your
[SSH and GPG keys](https://github.com/settings/keys) over on GitHub
under your profile settings.

If you're starting with no SSH keys follow the guide I made a while
back to
[Set up SSH for use with Git](https://scottspence.com/posts/set-up-ssh-for-use-with-git)

## Why Ed25519?

I'm using Ed25519 for this guide as it's
[considered more modern and secure than RSA](https://documentation.suse.com/sles/15-SP6/single-html/SLES-security/index.html#sec-ssh-authentic-gen-key)
while being shorter and equally (or more) secure. If you're setting up
fresh, this is the way to go.

## Setting up SSH for GitHub

So, remember, I'm on a new install of Ubuntu 24.04 here, so, no SSH
directory set up or anything! First up, I'll get the SSH directory
created with the correct permissions:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

Now, create the SSH key files with the right permissions as well, the
file name here `id_ed25519` can be whatever you want it to be:

```bash
touch ~/.ssh/id_ed25519
touch ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

After adding my keys to these files, start the SSH agent and add my
key:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

## Testing GitHub Connection

To verify everything's working, I'll run:

```bash
ssh -T git@github.com
```

If you're doing this you should see a success message from GitHub
confirming your authentication is working.

## Setting up Git Config with SSH Signing

Now for the interesting bit! I'll configure Git to use SSH for both
authentication and commit signing. Here's my Git config that I've been
using for a while now:

```ini
# User details
[user]
  name = username
  email = username@example.com
  signingkey = /home/username/.ssh/id_ed25519

# Help with typos
[help]
  autoCorrect = 20

# Pull settings
[pull]
  ff = only
  rebase = true

# Default branch name
[init]
  defaultBranch = main

# Fix conflicts only once
[rerere]
  enabled = true

# Auto prune when fetching
[fetch]
  prune = true

# GPG settings for SSH signing
[gpg]
  format = ssh

[commit]
  gpgsign = true
```

The `signingkey` is pointing to the private key location.

## Setting up SSH Signing

For commit signing to work, I'll need to create an allowed signers
file:

```bash
touch ~/.ssh/allowed_signers
```

Add my key to the allowed signers file:

```bash
echo "username@example.com ssh-ed25519 X_KEY_GOES_HERE_X" > ~/.ssh/allowed_signers
```

Then tell Git about the allowed signers file:

```bash
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

## Testing Commit Signing

To test that everything's working:

```bash
# Create a test directory
mkdir ~/git-signing-test
cd ~/git-signing-test
git init

# Create a test file
echo "# Test signing" > README.md
git add README.md

# Commit with signing
git commit -m "test: verify commit signing"

# Verify the signature
git log --show-signature -1
```

I then see output confirming the commit was signed successfully,
something like:

```bash
commit a35a8bedf3d85e31a504a406756792e98f7d60c9 (HEAD -> main)
Good "git" signature for username@example.com with ED25519 key SHA256:X_KEY_GOES_HERE_X
Author: username <username@example.com>
Date:   Mon Jan 27 19:08:48 2025 +0000

    test: verify commit signing
```

Sweet!

## Adding Multiple SSH Configs

Now, as I have to sign into many VPS instances I have to specify them,
I was using 1Password for this but I've cone back to the classic
config now as I can't trust 1Password SSH client not to mess it up!

Here's an example setup:

```bash
# Create the config file if it doesn't exist
touch ~/.ssh/config
chmod 600 ~/.ssh/config
```

Then add your configurations:

```bash
Host server_1
	HostName your-ip-here
	User admin
	IdentityFile ~/.ssh/id_server_1
	Port 22

Host server_2
	Hostname your-ip-here
	User admin
	IdentityFile ~/.ssh/id_server_2
	Port 22
```

Don't forget to create and set permissions for the keys! Same as
before:

```bash
touch ~/.ssh/id_server_1
chmod 600 ~/.ssh/id_server_1
```

Again, this is presuming that you've already got the keys in
1Password.

## That's it!

Now I've got:

- SSH authentication working with GitHub
- Commit signing set up with a Ed25519 key
- A clean Git config with some nice defaults
- Additional SSH configs for other services

All of this without relying on 1Password to do the work I can't trust
it with anymore! 😅
