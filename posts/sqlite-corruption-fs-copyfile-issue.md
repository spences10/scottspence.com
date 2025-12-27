---
date: 2025-10-06
title: SQLite Corruption with fs.copyFile() in WAL Mode
tags: ['sql', 'database', 'docker', 'guide', 'notes']
is_private: false
---

<!-- cspell:ignore freelist -->

I was looking up something on my site for reference (as I usually do
when trying to recall a detail) when I noticed the popular posts in
the footer weren't displaying. That's odd. I'd been working with the
database locally recently, so my immediate thought was: "What have I
broken?"

Turns out, quite a lot.

## What happened?

Looking at the logs, I saw the `SQLITE_CORRUPT` error code everywhere.
The site itself was running fine, but all the database-driven features
– popular posts, analytics, stats – were gone. Database corruption in
production.

I needed to figure out which Docker container was actually running
production (if you need help with this, skip to
[Step 0: Find your production container](#step-0-find-your-production-container)).
Once I found it and got in, I checked the database integrity:

```bash
sqlite3 /app/data/site-data.db "PRAGMA integrity_check;"
```

The output was... not encouraging:

```
*** in database main ***
Page 42: btreeInitPage() returns error code 11
Freelist: 2 of 3 pages missing
...freelist link 2 corresponds to page 134
Tree 5 page 789: index entries are not in ascending order
Row 456 missing from index idx_posts
Row 789 missing from index idx_tags
...
[80+ more rows of pain]
```

Cool. Cool cool cool. 😅

## Thank goodness for local development

Here's where I got lucky: my local development database was healthy.
I'd been working on the site the day before, so I had a recent copy.
Without that, I'd have been properly screwed because – ALL my
production backups were corrupted too.

Every. Single. One.

The backups directory had 7 files, one for each day. I checked them
all. All corrupted. Same `SQLITE_CORRUPT` error on every single
backup.

That's when I realised I'd fundamentally broken my backup system.

## The root cause: fs.copyFile() is a trap

Here's what I was doing in my backup code:

```typescript
// ❌ DON'T DO THIS
import { copyFile } from 'node:fs/promises'

const db_path = '/app/data/site-data.db'
const backup_path = `/app/data/backups/site-data-${date}.db`

await copyFile(db_path, backup_path)
```

Looks innocent enough, right? **Wrong.**

SQLite in WAL (Write-Ahead Logging) mode uses three files:

- `site-data.db` – the main database file
- `site-data.db-wal` – the write-ahead log
- `site-data.db-shm` – shared memory file

When you use `fs.copyFile()`, you're only copying the `.db` file.
While that file is being copied, the `.db-wal` and `.db-shm` files are
still being written to. This creates an inconsistent snapshot and
causes instant corruption.

I'd been running this backup process every 6 hours (00:00, 06:00,
12:00, 18:00) for weeks, and every single backup was corrupted from
the moment it was created. I just didn't know it until I needed them.

Classic mistake, really.

## The second problem: backup overwrites

There was another issue with my backup strategy. The filename format
was:

```
site-data-YYYY-MM-DD.db
```

Notice what's missing? The hour. So when the backup ran at 00:00, it
created `site-data-2025-10-06.db`. Then at 06:00, it overwrote that
file. Then at 12:00, overwrote again. By 18:00, I only had one backup
per day, not four.

When the corruption happened at 08:39, the 06:00 backup was already
corrupted (because `fs.copyFile()` is broken), and there was no 00:00
backup to fall back to because it had been overwritten.

The numbers don't lie: I had 7 files but effectively zero working
backups.

## The recovery process

Here's how I got the site back online:

**Step 0: Find the correct container**

First, I needed to identify which Docker container was actually
running the production site. In Coolify (or any multi-container
environment), you might have several containers running:

```bash
# SSH into your production server
ssh your-server

# List all running containers
docker ps

# Filter for your app's containers
docker ps | grep your-app-name
```

This showed me several containers for different branches/PRs, but the
production one was identifiable by its recent start time and the
commit hash in the image name. Once I had the container name, I could
proceed.

**Step 1: Verify the damage**

```bash
# Enter the production container
docker exec -it your-container-name sh

# Check database integrity
sqlite3 /app/data/site-data.db "PRAGMA integrity_check;"
# Result: extensive corruption confirmed
```

**Step 2: Check all backups**

```bash
# Test each backup file
for backup in /app/data/backups/*.db; do
  echo "Testing $backup"
  sqlite3 "$backup" "PRAGMA integrity_check;"
done
# Result: all corrupted
```

**Step 3: Use local database**

Thankfully I had a healthy local copy. Time to get it to production:

```bash
# From WSL on local machine
# Note: 'coolify' is my SSH config alias for the production server
scp /home/scott/repos/scottspence.com/data/site-data.db coolify:/tmp/db-restore/
```

**Step 4: Replace production database**

```bash
# On production server
docker cp /tmp/db-restore/site-data.db your-container-name:/app/data/site-data.db

# Remove WAL and shared memory files
docker exec your-container-name sh -c "rm -f /app/data/site-data.db-wal /app/data/site-data.db-shm"

# Verify integrity
docker exec your-container-name sqlite3 /app/data/site-data.db "PRAGMA integrity_check;"
# Result: ok
```

Site back online. Total downtime: about 45 minutes.

## The fix: use SQLite's native backup API

Better-sqlite3 has a proper `.backup()` method that handles WAL mode
correctly. Here's what the fixed code looks like:

```typescript
// ✅ DO THIS
import Database from 'better-sqlite3'

const db_path = '/app/data/site-data.db'
const timestamp = new Date()
	.toISOString()
	.slice(0, 13)
	.replace('T', '-')
const backup_path = `/app/data/backups/site-data-${timestamp}00.db`

const source_db = new Database(db_path, { readonly: true })

try {
	await source_db.backup(backup_path)
	console.log(`Backup created: ${backup_path}`)
} finally {
	source_db.close()
}
```

The `.backup()` method:

- Handles all three SQLite files atomically
- Works correctly with WAL mode
- Ensures consistency during the backup process
- Returns a promise that resolves when the backup is complete

## Changes made

I updated three files in the codebase:

1. `/home/scott/repos/scottspence.com/src/routes/api/ingest/backup-database.ts`
   – backup creation
2. `/home/scott/repos/scottspence.com/src/routes/api/ingest/restore-database.ts`
   – restore logic
3. `/home/scott/repos/scottspence.com/src/routes/api/ingest/pull-database.ts`
   – pulling backups to local

I also changed the backup filename format from
`site-data-YYYY-MM-DD.db` to `site-data-YYYY-MM-DD-HH00.db`. Now each
of the four daily backups is preserved instead of overwriting.

Finally, I increased the retention from 7 to 28 backups (7 days × 4
backups per day). Storage is cheap; data loss is expensive.

## Lessons learned

**Don't use `fs.copyFile()` for SQLite databases in WAL mode.** It's
fundamentally broken and will corrupt your data. Always use SQLite's
native backup API.

**Test backups!** I had backups running for months, but I never
verified they actually worked. Every single one was corrupted, and I
only found out when I needed them. That's a proper skill issue on my
part.

**Multiple backups per day.** Daily backups aren't enough. If
corruption happens at 08:39 and my only backup is from 00:00, I've
lost 8+ hours of data. Four backups per day (every 6 hours) gives me
much better granularity.

**Document the recovery process.** I'm writing this whilst it's fresh
in my mind so future-me (or you) can recover faster next time. The
panic of production being down isn't the time to figure out
`docker cp` syntax.

## One more thing

If this happens to you and you need to recover quickly, here's the
command reference:

```bash
# Check database integrity
sqlite3 /path/to/database.db "PRAGMA integrity_check;"

# Copy healthy database from local to production server
scp /local/path/site-data.db your-server:/tmp/db-restore/

# On production server, copy into container
docker cp /tmp/db-restore/site-data.db container-name:/app/data/site-data.db

# Remove WAL and shared memory files
docker exec container-name sh -c "rm -f /app/data/site-data.db-wal /app/data/site-data.db-shm"

# Verify integrity
docker exec container-name sqlite3 /app/data/site-data.db "PRAGMA integrity_check;"
```

Have you had a database corruption incident? How did you recover? I'd
love to hear about it on
[Bluesky](https://bsky.app/profile/scottspence.dev).
