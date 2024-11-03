---
date: 2022-04-17
title: How to Configure Git Username and Email
tags: ['git', 'how-to']
is_private: false
---

The Git username and email are the bare minimum needed for when
working with Git to commit changes. It's also one of the first things
you do after installing Git.

The username and email are used to set the author of commits. Version
control wouldn't be much use if you didn't know who to blame for the
changes that broke production. 😂

## Set Global Git Username and Email

Using `git config` there's a few commands to get started. First check
to see if there is any config already in place with the `--list` flag.

```bash
git config --list
```

ℹ️ To leave the `--list` view in the terminal use the `q` key to quit
the view.

You can set the global username and email for Git with the
`git config` command and the `--global` flag.

The config here is presuming the use of GitHub where the name can be
the GitHub username and the email the email associated with the GitHub
username.

```bash
git config --global user.name yourGitHubUserName
git config --global user.email yourGitHub@Email.com
git config --list
```

ℹ️ To leave the `--list` view in the terminal use the `q` key to quit
the view.

The `git config` changes are saved to the home directory of the user
to a `.gitconfig` file. I'm using Linux so I can access it with a text
editor and point to the home path `~` and edit it with a text editor
like nano.

```bash
nano ~/.gitconfig
```

That will show me the current settings, which is currently only the
user details.

ℹ️ To leave the view in nano use the `Ctrl+x` to exit.

```bash
[user]
        name = yourGitHubUserName
        email = yourGitHub@Email.com
```

## Set Git Username and Email for a Specific Repository

When would you want to do this? Say you have a different username and
email that may have been assigned to you for working on a specific
project.

This is when it is handy to set the username and email for a specific
project.

To do that, change directory to the project and use the same Git
config commands without the `--global` flag.

```bash
cd my-project-im-working-on
git config user.name yourMaybeAssignedUsername
git config user.email yourMaybeAssigned@Email.com
```

This will set the username and email for this specific project.

## Conclusion

The Git username and email can be set using `git config` and the
`--global` flag, when needed specific user details can be set per
repository when inside the project directory and omitting the
`--global` flag.
