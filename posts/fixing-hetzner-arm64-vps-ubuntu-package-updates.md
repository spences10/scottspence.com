---
date: 2024-11-29
title: How to Fix Hetzner ARM64 VPS Package Updates on Ubuntu 24.04
tags: ['notes', 'guide', 'hetzner', 'vps']
is_private: false
---

Real quick one from me on updating a Hetzner VPS with something like
`apt update`. I noticed some weird behaviour today when I wanted to
install `sqlite3` on my Hetzner box. I was greeted with the following
message:

```bash
sudo apt install sqlite3
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Suggested packages:
  sqlite3-doc
The following NEW packages will be installed:
  sqlite3
0 upgraded, 1 newly installed, 0 to remove and 35 not upgraded.
Need to get 140 kB of archives.
After this operation, 587 kB of additional disk space will be used.
Err:1 https://mirror.hetzner.com/ubuntu/packages noble/main arm64 sqlite3 arm64 3.45.1-1ubuntu2
  404  Not Found [IP: 2a01:4ff:ff00::3:3 443]
E: Failed to fetch https://mirror.hetzner.com/ubuntu/packages/pool/main/s/sqlite3/sqlite3_3.45.1-1ubuntu2_arm64.deb  404  Not Found [IP: 2a01:4ff:ff00::3:3 443]
E: Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?
```

So a little searching with Perplexity which surfaced this result from
[geo.rocks](https://geo.rocks/post/hetzner_arm_update) apparently
Hetzner are no longer mirroring packages for ARM based systems. I'm
running Ubuntu 24.04.1 LTS on a Hetzner CAX (ARM64) server.

So, backup the existing `sources.list` file and create a new one.

```bash
cd /etc/apt
mv sources.list /root/sources.list.backup
```

Then open up the new `sources.list.d/ubuntu.sources` file.

```bash
nano /etc/apt/sources.list.d/ubuntu.sources
```

Then you get a pretty scary looking file.

```nano
## Note, this file is written by cloud-init on first boot of an instance
## modifications made here will not survive a re-bundle.
##
## If you wish to make changes you can:
## a.) add 'apt_preserve_sources_list: true' to /etc/cloud/cloud.cfg
##     or do the same in user-data
## b.) add supplemental sources in /etc/apt/sources.list.d
## c.) make changes to template file
##      /etc/cloud/templates/sources.list.ubuntu.deb822.tmpl
##

# See http://help.ubuntu.com/community/UpgradeNotes for how to upgrade to
# newer versions of the distribution.

## Ubuntu distribution repository
##
## The following settings can be adjusted to configure which packages to use from Ubuntu.
## Mirror your choices (except for URIs and Suites) in the security section below to
## ensure timely security updates.
##
## Types: Append deb-src to enable the fetching of source package.
## URIs: A URL to the repository (you may add multiple URLs)
## Suites: The following additional suites can be configured
##   <name>-updates   - Major bug fix updates produced after the final release of the
##                      distribution.
##   <name>-backports - software from this repository may not have been tested as
##                      extensively as that contained in the main release, although it includes
##                      newer versions of some applications which may provide useful features.
##                      Also, please note that software in backports WILL NOT receive any review
##                      or updates from the Ubuntu security team.
## Components: Aside from main, the following components can be added to the list
##   restricted  - Software that may not be under a free license, or protected by patents.
##   universe    - Community maintained packages.
##                 Software from this repository is only maintained and supported by Canonical
##                 for machines with Ubuntu Pro subscriptions. Without Ubuntu Pro, the Ubuntu
##                 community provides best-effort security maintenance.
##   multiverse  - Community maintained of restricted. Software from this repository is
##                 ENTIRELY UNSUPPORTED by the Ubuntu team, and may not be under a free
##                 licence. Please satisfy yourself as to your rights to use the software.
##                 Also, please note that software in multiverse WILL NOT receive any
##                 review or updates from the Ubuntu security team.
##
## See the sources.list(5) manual page for further settings.
Types: deb
URIs: https://mirror.hetzner.com/ubuntu/packages
Suites: noble noble-updates noble-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

## Ubuntu security updates. Aside from URIs and Suites,
## this should mirror your choices in the previous section.
Types: deb
URIs: https://mirror.hetzner.com/ubuntu/security
Suites: noble-security
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

Essentially, that last section needs changing from:

```nano
Types: deb
URIs: https://mirror.hetzner.com/ubuntu/packages
Suites: noble noble-updates noble-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: https://mirror.hetzner.com/ubuntu/security
Suites: noble-security
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

To:

```nano
Types: deb
URIs: https://mirror.hetzner.com/ubuntu-ports/packages
Suites: noble noble-updates noble-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: https://mirror.hetzner.com/ubuntu-ports/security
Suites: noble-security
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

Then I can run `sudo apt update` and `sudo apt install sqlite3`
without any issues.

So, we're good to go.

Thanks [geo.rocks](https://geo.rocks) and Perplexity.
