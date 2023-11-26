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
  IF NOT EXISTS post_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    date_grouping TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    uniques INTEGER,
    avg_duration REAL,
    bounce_rate REAL,
    last_updated INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  popular_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    title TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

SELECT
  pp.id,
  pp.pathname,
  p.title,
  pp.pageviews,
  pp.visits,
  pp.last_updated
FROM
  popular_posts pp
  JOIN posts p ON pp.pathname = '/posts/' || p.slug