CREATE TABLE
  page_current_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL,
    pathname TEXT NOT NULL,
    visitors_count INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL
  );

CREATE TABLE
  popular_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    title TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    time_frame TEXT NOT NULL CHECK (time_frame IN ('day', 'month', 'year')),
    last_updated TIMESTAMP NOT NULL
  );

CREATE TABLE
  posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    is_private BOOLEAN NOT NULL,
    preview TEXT NOT NULL,
    preview_html TEXT NOT NULL,
    reading_time_minutes REAL NOT NULL,
    reading_time_text TEXT NOT NULL,
    reading_time_seconds INTEGER NOT NULL,
    reading_time_words INTEGER NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tags TEXT NOT NULL,
    title TEXT NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  referrer_current_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_hostname TEXT NOT NULL,
    referrer_pathname TEXT,
    visitors_count INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL
  );

CREATE TABLE
  total_current_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL
  );