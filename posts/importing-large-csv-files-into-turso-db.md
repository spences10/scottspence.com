---
date: 2024-01-20
title: Importing Large CSV Files into Turso DB
tags: ['turso', 'cli', 'sql', 'analytics', 'guide']
is_private: false
---

<script>
  import { Banner } from '$lib/components'

  const options = {
    type: 'info',
    message: `I discovered the upper bound for importing CSV files 
    into Turso DB is 20,000 rows.

    If you have a CSV file with more than 20,000 rows you'll need to
    split the file with <code>COMMIT;</code> and <code>BEGIN TRANSACTION;</code> statements.
    `
  }
</script>

So, I've got these massive CSV files (some up to 233 thousand rows)
that I exported from Fathom Analytics. I want to import them into the
Turso DB I use for this site, so, eventually visitors will be able to
view the data. I'm lot leaving Fathom, I still think Fathom is a top
notch product I'm happy to pay for. Historical data _is_ available via
the Fathom API but it would absolutely hammer my allowance
([like I did at the start of 2023](https://scottspence.com/posts/caching-with-fathom-redis-and-sveltekit)).

I spent _many_ hours trying to get the data into the database via a
single use script then watched my Turso dashboard plan usage sky
rocket! 😂

There was a simpler way!

1. I had to read the docs!
2. I reached out to their dev rel and my buddy
   [Jamie Barton](https://twitter.com/notrab) who pointed me in the
   right direction.

It's a three step process, create a new database from the CSV file,
dump that into a file then import that into the existing database.

Cool! You can create a database from a CSV file with the Turso CLI,
but at the moment you can't import that into an existing database.
I'll go over how I did that in the following sections.

## Create database from CSV file

This is a temporary store that you can `destroy` with the Turso CLI
once you have shunted the data around.

For this example I'll be setting up the variables I'll be using in the
command line so it's clear what's going where.

```bash
TEMP_DB=csv-to-turso
CSV_FILE=./my-csv.csv
CSV_DUMP=dump.sql
CSV_TABLE_NAME=csv_table_export
EXISTING_DB=existing-db
```

This section is detailed in the
[Turso CLI docs](https://docs.turso.tech/cli/db/create#create-database-from-a-csv-file)
to create a new database from the CSV file:

```bash
turso db create $TEMP_DB --from-csv $CSV_FILE --csv-table-name $CSV_TABLE_NAME
```

I can now shell into the database and check the table schema:

```bash
turso db shell $TEMP_DB
```

In the shell I can check the table schema:

```sql
PRAGMA table_info(csv_table_export);
-- or
.schema
```

Here's the output:

```sql
.schema
CREATE TABLE "csv_table_export"( "Timestamp" TEXT, "Hostname" TEXT, "Pathname" TEXT, "Views" TEXT, "Uniques" TEXT );
```

You'll note that the table schema data types are all `TEXT` and I want
to change them to `TIMESTAMP` for the timestamp and `INTEGER` for the
`Views` and `Uniques` columns.

I'll come onto that part later.

## Check the validity of the data

There's a couple of checks that I want to do before I import the data
into my existing database.

**Null Value Check**: Ensure that none of the columns contain
unexpected null values.

```sql
SELECT * FROM csv_table_export
  WHERE "Timestamp" IS NULL
  OR "Hostname" IS NULL
  OR "Pathname" IS NULL
  OR "Views" IS NULL
  OR "Uniques" IS NULL;
```

**Data Type Validation**: Since all your columns are text, I want to
ensure that 'Views' and 'Uniques' columns contain only numeric data.

```sql
SELECT * FROM csv_table_export
  WHERE typeof("Views") != 'text' OR typeof("Uniques") != 'text';
```

**Special Characters in Text Fields**: Check for problematic
characters in text fields, such as unescaped single quotes.

```sql
SELECT * FROM csv_table_export
  WHERE "Hostname" LIKE '%''%' OR "Pathname" LIKE '%''%';
```

There was a sneaky unescaped `'` in there so I had to update the
table:

```sql
UPDATE csv_table_export
SET Pathname = replace(Pathname, '''', '')
WHERE Pathname LIKE '%''%';
```

Now I can create a dump of this database to import into my existing
database.

## Dump the temp database to a file

So this is the part I need to thank Jamie for, he pointed me to a
GitHub issue with the
[workaround](https://github.com/tursodatabase/turso-cli/issues/712)
for this.

Well, not entirely as I didn't know how to make the dump file from the
database, I found that
[in another issue](https://github.com/tursodatabase/turso-cli/issues/433#issuecomment-1558195176)
on the Turso CLI repo.

Ok, so, to create the dump of the database to a file:

```bash
turso db shell $TEMP_DB .dump > $CSV_DUMP
```

This will create a dump file in the current directory.

<Banner {options} />

If you take a look at the contents of the file you'll see something
like this:

```sql
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "csv_table_export"( "Timestamp" TEXT, "Hostname" TEXT, "Pathname" TEXT, "Views" TEXT, "Uniques" TEXT );
-- INSERT INTO csv_table_export VALUES...
```

Inserting more than 20,000 rows into the database will silently fail.

I had to break the dump file into smaller chunks, I did this by
inserting `COMMIT;` and `BEGIN TRANSACTION;` statements into the dump
file.

Something like this:

```sql
PRAGMA foreign_keys=OFF;
CREATE TABLE IF NOT EXISTS "csv_table_export"( "Timestamp" TEXT, "Hostname" TEXT, "Pathname" TEXT, "Views" TEXT, "Uniques" TEXT );

BEGIN TRANSACTION;
INSERT INTO csv_table_export VALUES...
-- 19,999 more rows
COMMIT;
```

So, for my 233 thousand row CSV file I had to split it into 12 files!
🥲

## Import the dump into the existing database

Sweet! So, now to import the dump file into my existing database:

```bash
turso db shell $EXISTING_DB < $CSV_DUMP
```

Again I can shell into my `$EXISTING_DB` and check on the table schema
for the import:

```sql
PRAGMA table_info(csv_table_export);
```

That gives me the following output:

```
CID     NAME          TYPE     NOTNULL     DFLT VALUE     PK
0       Timestamp     TEXT     0           NULL           0
1       Hostname      TEXT     0           NULL           0
2       Pathname      TEXT     0           NULL           0
3       Views         TEXT     0           NULL           0
4       Uniques       TEXT     0           NULL           0
```

All good, select some data from the table:

```sql
SELECT * FROM csv_table_export LIMIT 10;
```

Cool! Ok, as it stands the data types are all `TEXT` and I want to
change them to `TIMESTAMP` for the `Timestamp` and `INTEGER` for the
`Views` and `Uniques` columns.

## Convert table schema

So, now I'll create my desired schema for where I want the data to go
that I've imported:

```sql
CREATE TABLE analytics_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TIMESTAMP NOT NULL,
  hostname TEXT NOT NULL,
  pathname TEXT NOT NULL,
  views INTEGER NOT NULL,
  uniques INTEGER NOT NULL
);
```

Then I'll insert the data from the imported table into the new table
with the correct schema:

```sql
INSERT INTO analytics_pages (timestamp, hostname, pathname, views, uniques)
SELECT
  strftime('%Y-%m-%d %H:%M:%S', Timestamp),
  Hostname,
  Pathname,
  CAST(Views AS INTEGER),
  CAST(Uniques AS INTEGER)
FROM csv_table_export;
```

Check the data is in the table:

```sql
SELECT * FROM analytics_pages LIMIT 10;
```

Now I'm happy with the data I can drop the imported table from my
existing database:

```sql
-- Drop import table if not needed
DROP TABLE csv_table_export;
```

Also, I can delete the temporary database:

```bash
turso db destroy $TEMP_DB
```

That's it! I've imported the data from the CSV file into my existing
database.

## Conclusion

Wrapping up, I learned that importing massive CSVs into Turso DB is
simpler than it looks. By using the Turso CLI, I created a new
database from the CSV, converted it to a SQL dump, and then merged it
into my existing database.

This experience reminded me of the power of reading the docs and
tapping into community wisdom. It turns out, the easiest solutions are
often hidden in plain sight, just a question or a quick read away!

## Resources

- Create database from CSV file: https://docs.turso.tech/cli/db/create
- Workaround for importing CSV data into existing database:
  https://github.com/tursodatabase/turso-cli/issues/712
- How to create a dump file:
  https://github.com/tursodatabase/turso-cli/issues/433
