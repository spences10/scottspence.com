---
date: 2023-10-07
title: Updating BIOS on Motherboard
tags: ['windows', 'wsl', 'hardware', 'bios']
isPrivate: false
---

Real quick one for me! Future me that is!! I had to update the BIOS on
my motherboard, now a lot of manufacturers will recommend their
software which is usually hot garbage! Every time I try it I'm
prompted to install virus protection and other sketchy apps. No
thanks! I'll do it myself!

So, I need to know what my motherboard model is so I can go find if
there's been any BIOS updates. How do I do that? How To Geek have my
back with this post [How to Check Your Motherboard Model Number on
Your Windows PC].

## Get the motherboard model

There's loads of ways to do it in that post, essentially I want to
copy the model and paste it into a search engine. I went with the
`wmic` command:

<!-- cSpell:ignore serialnumber -->

```bash
wmic baseboard get product,Manufacturer,version,serialnumber
```

This prints out the manufacturer, model, version and serial number all
I wanted is the model (or product) number. I then copied that and
pasted it into a search engine and found the BIOS update page for my
motherboard.

Last update I did was for 2020 I think so I got the latest version
then had to do the dance of getting the BIOS extracted from the `.zip`
into my computer.

## Flash the BIOS

There's loads of videos detailing this, essentially extract the files
add it to a USB which you stick into a specific UBS hole in the back
of your motherboard.

I didn't have much luck with that as the only drive I could find was
my dedicated storage SSD that's connected to my motherboard. So, boot
up the machine again and add the files to the storage SSD.

Then I was offered the option to backup the current BIOS, I went
through the steps for that but on checking the drive there doesn't
seem to be a backup there!

So, a YOLO update as I flashed the BIOS with the new version before
checking the old one was backed up correctly!

## Enable virtualization

Last thing for me was to enable virtualization in the BIOS. I'm
running WSL2 and I need virtualization enabled for that to work.

So, back in the BIOS I went and enabled virtualization. Options for me
on the board I'm using are:

- Advanced CPU settings
  - SVM mode
    - Enabled

## Done

That's it, future Scott! I hope you find this useful!

<!-- Links -->

[How to Check Your Motherboard Model Number on Your Windows PC]:
  https://www.howtogeek.com/208420/how-to-check-your-motherboard-model-number-on-your-windows-pc/
