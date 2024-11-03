---
date: 2024-05-12
title: Setting up my VPS on Hetzner
tags: ['notes', 'guide', 'vps', 'hetzner']
is_private: false
---

<!-- cSpell:ignore hetzner, Coolify, Loginno, adduser, usermod, publickey, publickey -->

Aight! So, I've gone off of Fly.io, great service, I'll probably come
back to it in the future, but, now I'm going to set up my own VPS on
Hetzner.

There's threads from Puru on him doing it but he expertly didn't
document what he did, so, I'm going through that now as I set up my
own VPS on Hetzner.

[Puru](https://github.com/puruvj) mentions his journey on Twitter:

- here: https://twitter.com/puruvjdev/status/1776612010651787350
- here: https://twitter.com/puruvjdev/status/1778391569810235817

I'm going to fill in the gaps.

VPS essentially means I'm now managing my own server instead of using
a service like, Vercel, Netlify, or Fly.io and so on. So, there's
overhead in keeping my Ubuntu box (box being VPS server) up to date
but I do that sort of the thing on the regular being a WSL (Ubuntu)
user.

Why am I moving away from Fly.io? Well, reasons!

## Setting up a Hetzner account

So, to use Hetzner I first need an account and a credit card (yes you
have to pay up front!). Then there was the ID process where I had to
scan in my ID for approval. All pretty straightforward.

Then I get access to the Hetzner dashboard and I can create a new
server. The Create a Server page walks you through all the options,
there's a few options to pick from!

- Location, pick from five locations, eu-central, eu-west, us-east,
- Image, I went with Ubuntu 24.04
- Type, I followed Puru's lead and went with CAX11 shared CPU Arm64
- Networking, defaults
- SSH keys, created an SSH key and added the public key to the server
- Volumes, empty
- Firewalls, not configured, default
- Backups, default
- Placement groups, empty
- Labels, empty
- Cloud config, empty
- Name, generated for me

To gen my SSH key I used the following command on my local machine:

```bash
ssh-keygen -t rsa -b 4096 -C my@email.com
```

That generates the public and private SSH keys, I copy pasted the
public key to the Hetzner dashboard option, saved it and it's ready to
go.

Click the 'Create & Buy now' button and it's up and running!

Now it's a case of updating the server and securing it.

## Logging in

So the first attempt to log into the box was straightforward enough I
copied the IP address from the Hetzner dashboard and used the
following command:

```bash
# ip-address is copied from the Hetzner dashboard
ssh root@ip-address
```

So, totally guessed that the username was `root` and because I'm using
SSH I was signed straight in.

I'll go ahead and update, upgrade and auto remove all the packages on
the server with:

```bash
# autoremove removes packages that are no longer needed
apt update -y && apt upgrade -y && apt autoremove -y
```

Now I'm up to date I'll start getting the box ready for use!

Ok, so it's an IP address that anyone can access and yeah, there's
already bots trying to access the box! Using the following command:

```bash
tail -n 10 -f /var/log/auth.log
```

I start to see all the automated login attempts from bots trying to
compromise the server.

So, I guess I'm pretty secure as it's an SSH key to access the server,
but I'll check to see if there's a password for the root user with:

```bash
passwd -S root
```

In the output it shows an `L` which (from what I can tell) means that
the password is locked, so disabled password access. This will keep
the box relatively secure.

## Non root user

So I'm not logging into the box as the root user all the time I'm
going to create a new user called `me`.

```bash
adduser me
```

This adds a new user called `me` and prompts me to assign it a
password. I'll set up another SSH key for this user as well.

First up, I'll add the user to the sudoers group:

```bash
usermod -aG sudo me
```

Check the user is in the group:

```bash
groups me
```

It should show `sudo` in the output.

```bash
me : me sudo
```

I can now SSH into the box as the `me` user and I'm prompted to enter
the password I assigned the account when I created the `me` account.

```bash
ssh me@ip-address
```

What I want to do now though is generate a new SSH key for the `me`
user so that I can use it to access the server. Same as before to
generate the keys.

```bash
ssh-keygen -t rsa -b 4096 -C me@email.com
```

This time specifying a different file path and name for the generated
files.

```bash
Generating public/private rsa key pair.
Enter file in which to save the key (/home/me/.ssh/id_rsa): /home/me/.ssh/non_root_user
```

I'll not be using the Hetzner dashboard to add the public key to the
box, I'll be using the `authorized_keys` file on the server this time.

Over on the server as the `me` user I'll create the `.ssh` directory
and then add the public key to the `authorized_keys` file.

```bash
mkdir .ssh
nano .ssh/authorized_keys
```

Nano will create the `authorized_keys` file for me, I'll paste in the
public key, write out the changes with Ctrl+o then Ctrl+x to exit.

I can then exit out of the server again and log in as the `me` user
pointing to the `non_root_user` key.

```bash
ssh -i /home/me/.ssh/non_root_user me@ip-address
```

## Disable password login

Aight, now I have my SSH login working I'll disable password login on
the non root user account.

There's a `sshd_config` file with a couple of options I'll be
configuring, so, open the file:

```bash
sudo nano /etc/ssh/sshd_config
```

The option for password authentication I'll change to `no`.

```bash
PasswordAuthentication no
```

Then I can `exit` out again, try logging in as the `me` user without
the SSH key:

```bash
ssh me@ip-address
```

I get the following message:

```bash
Permission denied (publickey).
```

Meaning that I can only authenticate with the SSH key.

## Disable login as root

Now to completely disable root login, I'll need to edit the
`/etc/ssh/sshd_config` file again as my `me` user.

```bash
# change from PermitRootLogin prohibit-password
PermitRootLogin no
# also add in the option to disconnect after a period of inactivity
ClientAliveInterval 300
ClientAliveCountMax 1
```

Validate the configuration with:

```bash
sudo sshd -t
```

If there are any errors then I'll need to fix them.

As an example I didn't leave a space in the permit root login option,
here's the validation message:

```bash
/etc/ssh/sshd_config line 33: no argument after keyword "PermitRootLoginno"
/etc/ssh/sshd_config: terminating, 1 bad configuration options
```

Then `exit` and try to log in as root and:

```bash
Permission denied (publickey).
```

Success!

Now it's just my `me` user that I can log in as.

## Conclusion

So, I've set up and secured my own VPS on Hetzner, this is just a
starting point and there's still a lot to do and configure. I'll be
playing around with this now to get things configured the way I want,
still no node or any DNS set up just yet, but the intention is to do
that using something like nvm and Caddy to handle that.

Then there's the whole managing projects with GitHub and adding deploy
keys so only that the server can access only that repo on GitHub.

So, possibly another two three posts on this! 😅

I'll leave it at that for now though!

## Further configuration

There's a really comprehensive guide on the Hetzner community forum
that covers a lot of additional options for Securing the SSH service
that I've linked in the resources section.

For me, for now, I'm going to leave it where it is, for now.

## Resources

Written content over on the Hetzner community forum:

- Securing the SSH service:
  https://community.hetzner.com/tutorials/securing-ssh

There's very comprehensive guides in video format from the Syntax
team, I'm going to be checking out the Caddy one next:

- Set up and secure your own server:
  https://www.youtube.com/watch?v=Q1Y_g0wMwww
- Run Multiple Apps with Caddy | DNS, Static Sites, Reverse Proxies
  and Let's Encrypt: https://www.youtube.com/watch?v=mLznVlBAtcg
- Set up Coolify | Self Hosted PaaS with Zero Config Deployments:
  https://www.youtube.com/watch?v=taJlPG82Ucw
