---
date: 2025-12-22
title: Switching to EndeavourOS from Omarchy
tags: ['endeavouros', 'linux', 'notes']
is_private: false
---

<!-- cspell:ignore Omarchy nvme GDDR journalctl AORUS CMDLINE mkconfig ghostty calt liga dlig deeb zcompdump compinit ddcutil Espanso -->

I spent some time over the last few days evaluating some Linux
distros, two to be precise. Omarchy and EndeavourOS, Omarchy stayed on
my hard drive for all of about 16 hours as I just couldn't get my head
around the tiling manager! I tried! I really did! I just want to run
apps fullscreen and Alt+Tab between them like a normal person. But
Hyprland kept forcing everything into tiles, and honestly? It was
doing my head in. 😅

I'm not here to slag it off, loads of people love it! I'm happy for
them! Omarchy just wasn't for me. So I decided to switch to
EndeavourOS with KDE Plasma, which would give me a familiar feel and
have almost identical windows management shortcut keys I'm used to.

As with all of the posts I make on this blog, this is for me to come
back to and reference, so, a lot of stuff on here is for me to refer
back to if I haven't updated my
[settings](https://github.com/spences10/settings) or
[dotfiles](https://github.com/spences10/dotfiles) I keep for this
exact scenario!

Right! Preamble over, let's talk about the first oops!

## I wiped the wrong drive

So here's where I massively messed it up.

I've got three drives in my PC:

- `nvme0n1` - Samsung 990 PRO 1TB (mass storage, all my stuff)
- `nvme1n1` - Samsung 970 EVO 500GB (Windows)
- `sda` - Samsung 860 EVO 1TB (where I'd just installed Omarchy)

My plan was simple, wipe the 860 EVO (`sda`) where Omarchy was, put
EndeavourOS there instead.

What I actually did, wiped the 990 PRO (`nvme0n1`) and lost a bunch of
data. 🥲

I got cocky, didn't check the dropdown in the installer, clicked
through too fast, and paid for it. I didn't notice until I wanted to
move some stuff between the Windows and Linux drives via mass storage
and... nothing was there.

Triple-check your where you're installing to! I've done this a couple
of times now, to the point where I will take out a drive (the Samsung
970 EVO 500GB) just to be sure and I still managed to cock it up!

## NVIDIA drivers

From the EndeavourOS installer (ISO boot menu) you get the option to
select NVIDIA drivers if you've got an NVIDIA GPU. I've got a Gigabyte
NVIDIA GeForce RTX 3050 EAGLE OC (8GB GDDR6), so at the boot menu I
selected **EndeavourOS x86_64 UEFI NVIDIA**. This sets up the
proprietary drivers from the get-go.

I also added 32GB of swap (matching my RAM) for hibernate and video
editing. Swap's dead useful for that sort of thing.

Click through the rest of the options, confirm then done! Took about
ten minutes.

## EndeavourOS welcome

The first thing you're greeted with is the EndeavourOS welcome screen.
There was a load of stuff on there I clicked through from the "After
Install" tab, mirrors and package updates, got that done then restart.

## Apps

Then all the apps I need to be able to do what I want to do, so:

- 1Password
- VS Code
- Ghostty
- Spotify

I found out about `yay` and you can just `yay package-name` and it'll
list what's available in Arch User Repository (AUR) and the official
repos.

This is a quick reference guide for me on `yay` commands:

```bash
# Install a package
yay -S package-name
# Search for packages
yay package-name
# Update all packages (official + AUR)
yay -Syu
# Remove a package
yay -R package-name
# Remove package + dependencies no longer needed
yay -Rs package-name
# Search installed packages
yay -Qs package-name
# Get info about a package
yay -Si package-name
```

## Bluetooth fix

Can't listen to my tunes!! Bluetooth wasn't working after install.
Turned out it just wasn't enabled for some reason.

I checked with:

```bash
systemctl status bluetooth

○ bluetooth.service - Bluetooth service
     Loaded: loaded (/usr/lib/systemd/system/bluetooth.service; disabled; preset: disabled)
     Active: inactive (dead)
       Docs: man:bluetoothd(8)
```

The fix? Enable it and start it:

```bash
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

## Suspend/wake issues

Ok, this is where things get interesting (and by interesting I mean I
lost most of a day to this ballache).

I'd actually sat down to write this blog post. Thought I'd quickly fix
the visual glitches on wake with EndeavourOS first. Five hours later I
was still trying to get my system to wake up at all, never mind with
glitches.

What would happen is the system would suspend fine, but on wake it
would just... shut off completely. Not crash. Not freeze. Just power
down.

I tried the following:

- Switched to X11 (Wayland issue?) - nope, same thing
- Fresh reinstall - nope, still broken

Something else was going on.

After a proper deep dive into `journalctl`, and by this I mean
consulting Claude! I found the culprit: my Gigabyte X570 I AORUS PRO
WiFi motherboard has a buggy ACPI thermal zone called `PCT0`. On wake,
it was reporting a "critical" temperature of **21°C** and triggering
an emergency shutdown. 😂

The math doesn't add up, right? 21°C is not critical. It's not even
room temperature. But the motherboard firmware is pants and I don't
want to roll the dice on a BIOS update, so here we are.

The fix was adding a kernel parameter to GRUB:

```bash
sudo nano /etc/default/grub
```

Add `thermal.off=1` to the `GRUB_CMDLINE_LINUX_DEFAULT` line:

```text
GRUB_CMDLINE_LINUX_DEFAULT="... thermal.off=1"
```

Then update GRUB:

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

Apparently `thermal.off=1` **only** disables the buggy ACPI thermal
zones. The actual temperature monitoring via `sensors` still works
fine (k10temp, nvme, gigabyte_wmi all still report).

After this, suspend/wake worked properly. Massive relief!

I still get artefacts after wake. That's an NVIDIA + Wayland thing,
but it's liveable. If it works, it works.

## Docking station USB reset

I've got a DisplayLink dock that needed power cycling every single
boot. Why? If I didn't turn the dock off and on again the ethernet
connection wouldn't work.

The fix was a systemd service to reset the USB device (`17e9:6000`) at
boot using `usbreset`:

```bash
sudo tee /etc/systemd/system/displaylink-reset.service << 'EOF'
[Unit]
Description=Reset DisplayLink dock at boot
After=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/usbreset 17e9:6000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable displaylink-reset.service
```

If you're having USB issues, look into `usbreset`.

## Ghostty terminal setup

This is what I'll probably be referencing in the future. I switched to
[Ghostty](https://ghostty.org) for my terminal. Here's my full config
(`~/.config/ghostty/config`):

```text
# Theme
theme = night-owl

# Font
font-family = "VictorMono Nerd Font Mono"
font-size = 16
font-feature = +calt
font-feature = +liga
font-feature = +dlig

# Window size on startup (columns x rows)
window-height = 30
window-width = 120

# Optional nice-to-haves
window-padding-x = 10
window-padding-y = 10
cursor-style = bar
cursor-style-blink = true

keybind = ctrl+t=new_tab
keybind = ctrl+w=close_surface
right-click-action = copy-or-paste
keybind = ctrl+v=paste_from_clipboard
keybind = shift+enter=text:\x1b\r
```

The `right-click-action = copy-or-paste` is the familiar behaviour I'm
used to in other terminals.

I also created a custom Night Owl theme
(`~/.config/ghostty/themes/night-owl`):

```text
# Night Owl theme for Ghostty
# Based on Sarah Drasner's Night Owl

background = 011627
foreground = d6deeb
cursor-color = 80a4c2
selection-background = 1d3b53
selection-foreground = d6deeb

# Normal colors
palette = 0=#011627
palette = 1=#ef5350
palette = 2=#22da6e
palette = 3=#addb67
palette = 4=#82aaff
palette = 5=#c792ea
palette = 6=#21c7a8
palette = 7=#d6deeb

# Bright colors
palette = 8=#575656
palette = 9=#ef5350
palette = 10=#22da6e
palette = 11=#ffeb95
palette = 12=#82aaff
palette = 13=#c792ea
palette = 14=#7fdbca
palette = 15=#ffffff
```

## Zsh config difference

I followed
[My Updated ZSH Config 2025](https://scottspence.com/posts/my-updated-zsh-config-2025)
for setting up my shell, again, familiarity for me is the priority.

Changed this:

```bash
# Cache completions aggressively
if [[ $(stat -f%m ~/.zcompdump) -lt $(date -v-24H +%s) ]]; then
  compinit
else
  compinit -C
fi
```

On Linux, that doesn't work. I simplified it to just:

```bash
# Cache completions aggressively
autoload -Uz compinit
compinit -C
```

Done.

## Espanso text expander

I wanted a BeefText alternative for Linux. Espanso was the obvious
choice. However...

The AUR package was having issues with Wayland (at the time of
writing).

The AppImage worked:

```bash
cd ~/Downloads
wget https://github.com/espanso/espanso/releases/download/v2.3.0/espanso-wayland-x86_64.AppImage
chmod +x espanso-wayland-x86_64.AppImage
./espanso-wayland-x86_64.AppImage init
```

Config lives in `~/.config/espanso/match/`.

I've had issues with it not working as expected so, I'm leaving this
for now until I have another five hours to kill. 😂

## KDE quirks

KDE Plasma is nice, but it's got a couple of quirks:

1. **Session restore** - workspace assignments don't always stick
   after a reboot. So, apps opening on the wrong workspace.
2. **Monitor brightness** - resets on wake. Sometimes. Will keep an
   eye on it.

Apart from that I feel right at home! Keyboard shortcuts are more or
less the same as what I'm used to, I can navigate around quickly and
generally feel productive.

## Conclusion

A bit rambly, but there you go. Just some of the things I came up
against when trying out a new OS. I've been using Windows as a daily
driver for around 4 years now.

This is my daily driver (for) now.
