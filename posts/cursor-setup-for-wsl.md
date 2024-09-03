---
date: 2024-09-03
title: Cursor Setup for WSL
tags: ['wsl', 'cursor', 'guide']
isPrivate: true
---

<script>
  import { Gist } from 'sveltekit-embed'
</script>

The WSL Cursor setup, debugging your setup before you even code! I
initially tried Cursor around 18 months ago when I saw something from
[Catalin](https://x.com/catalinmpit) about it. At the time I couldn't
get past launching it with the `cursor .` command.

With all the hype going around about it, it was only a matter of time
before I had to try it out again. Guess what? It was exactly the same
issue from the last time I tried using it. This time I gave it a good
shake trying to se it up and running and with some digging around on
the Cursor GitHub issues I found a solution.

This is a guide referencing all the those helpful people on the Cursor
GitHub issues that commented with their solutions. I pieced together
this guide with some trial and error and I'm putting here for future
me.

## Thanks

Ok, let me get the thanks out of the way first. Thanks to these GitHub
users that gave me enough information to get this working.

<!-- cSpell:ignore lesmo,KadirBalku,ddwang Sinuhé Coronel Kadir Balku -->

- [Sinuhé Coronel](https://github.com/lesmo) with the initial details
  on resolving the issue
- [Kadir Balku](https://github.com/KadirBalku) with details on
  cleaning system and resolving `PATH` issues.
- [Daniel Wang](https://github.com/ddwang) for sharing a Gist that
  means there's no messing around trying to get the Commit has of your
  Cursor install.

Now, if you don't use the terminal to launch Cursor then you're good,
really, but if, like me you do a lot of your navigating around
projects via the file system then open up your projects from the
terminal (with `code .`) then you'll probably want to read through
this.

## Fresh install

This is the first time you have thought about using Cursor then this
will get you set up with it.

Using
[WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget)
I can install cursor from a PowerShell prompt:

```powershell
winget install Anysphere.Cursor
```

Open Cursor from the Windows start menu and it will give you the
initial setup prompt, ℹ️ **don't click the options that will add
`PATH` variables for `+code button`, or `+cursor button`.**

Ok, if I chose _not_ to install the settings and extensions from VS
Code then I'll at least need to install the
[WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
extension. Connect to WSL, and check that the `~/.cursor-server/` is
present.

I'll need to amend my `PATH` variable to now to include the path to
the `cursor` command.

<!-- cSpell:ignore printenv -->

Log out my path variables with `printenv PATH` copy the output into a
text editor.

Then append the cursor command path to the end of `printenv PATH`
output.

```bash
:/mnt/c/Users/<USER_NAME>/AppData/Local/Programs/cursor/resources/app/bin
```

Change `<USER_NAME>` to my actual Windows username.

To make this more permanent I can add the path to my `.zshrc` file:

```bash
echo -e '\n# Cursor \nexport PATH="$PATH:/mnt/c/Users/<USER_NAME>/AppData/Local/Programs/cursor/resources/app/bin"' >> ~/.zshrc
```

Then source the `.zshrc` file with `source ~/.zshrc`.

Now I should be able to run the `cursor .` command by navigating the
the file and running it from the terminal.

I should be able to navigate to the file located at:

```bash
/mnt/c/Users/<USER_NAME>/AppData/Local/Programs/cursor/resources/app/bin/cursor
```

This will give me the following output:

```text
To use Cursor with the Windows Subsystem for Linux, please install Cursor
in Windows and uninstall the Linux version in WSL. You can then use the
`cursor` command in a WSL terminal just as you would in a normal command
prompt.
Do you want to continue anyway? [y/N]
```

👆 this is complete bullshit, as it's already installed, it's just
that the script is borked.

To the first helpful comment I found was from ddwang, who was able to
get the script working with the following, you can find that
[in this comment](https://github.com/getcursor/cursor/issues/807#issuecomment-1728885825)
which points to
[this Gist](https://gist.github.com/swayducky/8ba8f2db156c7f445d562cdc12c0ddb4).

There were a couple of bits that don't work as expected so I've forked
it here 👇

<Gist gistUri="spences10/b40b2d9b27f62a930b3e5fcc12b0f782" />

I changed the following...

Line 28:

```diff
+APP_NAME="cursor"
-APP_NAME="code"
```

And I commented out lines 70-73 which I think is trying to overwrite
the `code` command.

```diff
+# if [ ! -d "$MY_CLI_DIR_YO/code" ]; then
+#     ln -s "$MY_CLI_DIR_YO/cursor" "$MY_CLI_DIR_YO/code"
+# fi
-if [ ! -d "$MY_CLI_DIR_YO/code" ]; then
-     ln -s "$MY_CLI_DIR_YO/cursor" "$MY_CLI_DIR_YO/code"
- fi
```

Running the `cursor .` command with those lines enabled gave me the
following:

```text
cursor .
ln: failed to create symbolic link '/home/<USER_NAME>/.cursor-server/bin/<CURSOR_COMMIT>/bin/remote-cli/code': File exists
```

With that commented out I was able to run the `cursor .` command with
no issues.

That should be it! 🎉

## Re-install start again

If, like me, you've already installed Cursor things have gone tits up
and you'll need to re-install it.

So, do that first, however you installed it either through WinGet or
the Windows settings.

Then, you'll need to remove all remnants of the old install.

This is where I found issue `870` (still open after a year) from the
Cursor GitHub issues, which has a load of great resources, firstly was
[this comment from lesmo](https://github.com/getcursor/cursor/issues/870#issuecomment-1951864065)
which give some good info but didn't really work for me.

Then there was
[this guide from KadirBalku](https://github.com/getcursor/cursor/issues/870#issuecomment-2204635232)
which is very thorough and worked for me.

Using the Windows Run prompt (Win+R) and entering `%userprofile% will
take you to the Windows user profile folder.

Delete the following folders:

```powershell
C:/Users/<USER_NAME>/.cursor/
C:/Users/<USER_NAME>/.cursor-tutor/
```

Then using the file explorer navigate to the following folders and
delete anything in them relating to Cursor:

```powershell
C:/Users/<USER_NAME>/AppData/Local/Programs/
C:/Users/<USER_NAME>/AppData/Local/
C:/Users/<USER_NAME>/AppData/LocalLow/
C:/Users/<USER_NAME>/AppData/Roaming/
```

Now we're good to go and can follow the
[Fresh install](#fresh-install) steps.

If you already have Cursor in your `PATH` then you can follow the
steps in the [Fresh install](#fresh-install) section but remember to
append the `cursor` command to the **end** of your `PATH` variable.

That's it, I hope this helps someone else out!
