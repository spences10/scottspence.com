---
date: 2022-02-25
title: Consolidate Chat Sources for Use in OBS with Social Stream
tags: ['obs', 'how-to', 'streaming']
isPrivate: false
---

Do you ever watch a live stream and wonder how the chat is shown? If
you have and you've searched online you'd probably have found videos
detailing how to do this with services like Streamlabs, or Stream
Elements. These involve configuring the panel you want in their
service and copying a URL to use as a browser source in Open
Broadcaster Software (OBS).

I've just found out about this awesome tool from [Steve Seguin] on
GitHub called [Social Stream]. It's a browser extension that allows
you to consolidate chat sources from different platforms like YouTube,
Twitch, Facebook and the like.

## Who's this for then?

If you use OBS and stream to more than one destination, like Twitch
and YouTube using a service like Restream, then this is for you!

With services like this the chat can get fragmented sometimes between
the platforms. Also if you have a chat overlay as a browser source in
OBS you can typically only use one source in Streamlabs, or Stream
Elements (either YouTube or Twitch). Meaning you'd have to have two
chat panels.

## Install the Social Stream extension

The Social Stream extension is available for download from GitHub, you
can get the latest version from [here]. 👈 Clicking that link will
download a `.zip` from GitHub.

Because the extension isn't on the Chrome store, you'll need to
install it manually. The zip file will need to be extracted out into
it's own folder.

There's a great guide on the GitHub repo explaining [how to do this
for Chrome].

I'm using Edge, so I'll need to go to [`edge://extensions/`] and
toggle the 'Developer mode' option.

[![edge-developer-mode-toggle]] [edge-developer-mode-toggle]

Then at the top of the page I can select the 'Load unpacked' option.
This will open a file dialogue where I can select the folder for the
extracted zip.

[![edge-load-unpacked-extension]] [edge-load-unpacked-extension]

That's the extension loaded now I can use it.

## Using Social Stream extension

Now I've got the extension installed there's a few options you get
when clicking on it.

[![social-stream-ninja-browser-extension-options]]
[social-stream-ninja-browser-extension-options]

First I'll need to '⚡Enable extension' clicking that will change the
background colour of the extension. Then I'll check a couple of the
options on there:

- Hide source icon
- Hide timestamp
- Hide overlay after 20s
- Auto-reply to "hi" messages
- Filter out duplicate messages echoes

[![social-stream-ninja-browser-extension-options-selected]]
[social-stream-ninja-browser-extension-options-selected]

Notice that the URLs for the 'Dockable streaming chat link' and the
'Single message overlay link' have changed?

Those two link are what I'll be using in OBS once I've got some live
chats linked up to the extension.

## Capture chat sources in Social Stream

Now to demo this I'm going to open a new tab in Edge and go find a
YouTube channel that is 'Live' which has chat enabled.

In the top right of the chat panel I can select to pop out the chat,
this is important as Social Stream wont capture the chat if it's not
popped out.

Now the chat is popped out I can click the 'Dockable streaming chat'
link and the 'Single message overlay' link.

So in the 'Dockable streaming chat' tab I can see the live chat, if I
click on one of the messages it will show in the 'Single message
overlay' tab for 20 seconds.

Pretty neat right?

Ok, so no if I go to Twitch and find another streamer that's on with a
lot of chat I can do the same. In Twitch the option to pop out the
chat is behind the cog on the bottom right of the panel.

Now on both YouTube and Twitch I can pause the videos on both as
they're not needed, it also helps save resources.

## Add Social Stream to OBS

Now that I have Social Stream set up I can add it to OBS.

By the way, the chat sources should be from your own channels when
doing this I'm using other peoples because I'm not streaming myself.

In OBS I'm going to create a new scene, call it 'social-stream-chat'
then in the sources I can add a new browser source.

[![obs-add-browser-source]] [obs-add-browser-source]

I'll create a new source and call it
'social-stream-single-message-overlay' click ok, then the properties
dialogue will show.

[![obs-browser-source-properties-dialogue]]
[obs-browser-source-properties-dialogue]

In here I can add in the URL for the chat source and the URL for the
'Single message overlay link' from the browser, I'll add the
dimensions of 1920 for the width and 200 for the height.

Now any time I select a chat message from the 'Dockable streaming chat
link' tab it shows up in the OBS scene I created!

That's awesome and all but you now have to manage a browser tab for
your chat as well as OBS, well Steve has got you covered for that too
because you can make a dock in OBS and control it there!!! 🤯

In OBS got to Docks in the menu then select 'Custom Browser Docks', in
the dialogue I can add the new doc name, I'll call it 'Social Stream
Chat' and paste in the 'Dockable streaming chat link' tab URL. Click
'Apply' I now have a new dock where I can manage the chat from!

## So configurable!

Say you don't like how the overlay looks, you can change any part of
it! Pop open the dev tools in the browser on either the 'Dockable
streaming chat link' or the 'Single message overlay link' and you can
inspect the css variables for each element you'd like to change.

You can find the CSS variables in the `index.html` file inside the
extracted folder for Social Stream. Find the variable you want to
change, change it then use that in the browser.

Example, instead of using the hosted version of the file, which is
something like:

```bash
https://socialstream.ninja/index.html?session=TYLSfghEdb
```

That would change to the local file location, so in the browser the
above would look something like:

<!-- cSpell:ignore TYLSfghEdb -->

```bash
file:///C:/Users/scott/Downloads/social_stream-main/index.html?session=TYLSfghEdb
```

## Conclusion

I've gone and added chat from two services together, YouTube and
Twitch and added them to one panel in OBS.

That's it! Well that's all I've got to documenting right now, there's
a lot of other additional stuff you can manage in there yourself!

Steve did I great explainer video on using it as well you can check
that out over on [YouTube]!

<!-- Links -->

[steve seguin]: https://github.com/steveseguin
[social stream]: https://github.com/steveseguin/social_stream
[here]:
  https://github.com/steveseguin/social_stream/archive/refs/heads/main.zip
[how to do this for chrome]:
  https://github.com/steveseguin/social_stream#to-install
[`edge://extensions/`]: edge://extensions/
[youtube]: https://www.youtube.com/watch?v=X_11Np2JHNU

<!-- Images -->

[edge-developer-mode-toggle]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645804438/scottspence.com/edge-developer-mode-toggle.png
[edge-load-unpacked-extension]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645804996/scottspence.com/edge-load-unpacked-extension.png
[social-stream-ninja-browser-extension-options]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645805384/scottspence.com/social-stream-ninja-browser-extension-options.png
[social-stream-ninja-browser-extension-options-selected]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645806059/scottspence.com/social-stream-ninja-browser-extension-options-selected.png
[obs-add-browser-source]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645809147/scottspence.com/obs-add-browser-source.png
[obs-browser-source-properties-dialogue]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1645809699/scottspence.com/obs-browser-source-properties-dialogue.png
