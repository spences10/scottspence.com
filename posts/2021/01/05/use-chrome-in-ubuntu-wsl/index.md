---
date: 2021-01-05
title: Use Google Chrome in Ubuntu on Windows Subsystem Linux
tags: ['guide', 'linux', 'ubuntu', 'wsl']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

This is a specific usecase for installing Google Chrome in Ubuntu on
WSL.

On Ubuntu, Snap is the preferred method to install Chromium and
although snap is on the WSL image you get from the Microsoft store
it's not functional. There is a [solution untested by me] that may
work.

There's a nice post from [Greg Brisebois] on getting set up for
Selenium in WSL and this is partly pulled from there, if you want to
use it for Selenium then check out his post.

ℹ Prerequisites for this is that you are already set up to use GUIs on
WSL, if you've not done that then check out [this post].

Here's a video detailing the process:

<YouTube youTubeId="RNesoCuLMO8" />

Dependencies, make sure you're up to date first:

```bash
sudo apt update && sudo apt -y upgrade && sudo apt -y autoremove
```

Download and install Chrome:

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt -y install ./google-chrome-stable_current_amd64.deb
```

Check that it's installed ok:

```bash
google-chrome --version
```

Done! Now it can be used either from the command line `google-chrome`
and with CLI tools like Cypress, Playwright, Puppeteer etc.

There's also a [really detailed post] on getting Chromium set up on
Linux from Addictive Tips.

<!-- Links -->

[this post]: https://scottspence.com/posts/gui-with-wsl/
[solution untested by me]:
  https://github.com/microsoft/WSL/issues/2374#issuecomment-699110721
[greg brisebois]:
  https://www.gregbrisebois.com/posts/chromedriver-in-wsl2/
[really detailed post]:
  https://www.addictivetips.com/ubuntu-linux-tips/install-chromium-on-linux/
