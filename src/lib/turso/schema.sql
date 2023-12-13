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
  post_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    date_grouping TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    uniques INTEGER,
    avg_duration REAL,
    bounce_rate REAL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, date_grouping)
  );

CREATE TABLE
  popular_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    date_grouping TEXT NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pathname, date_grouping)
  );

CREATE TABLE
  pricing_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    annual_rate_eur INTEGER,
    chosen_holidays INTEGER,
    public_holidays INTEGER,
    working_days_in_year INTEGER,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  exchange_rates (
    id INTEGER PRIMARY KEY,
    currency_code TEXT NOT NULL UNIQUE,
    rate REAL NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  reactions (
    id INTEGER PRIMARY KEY,
    post_url TEXT NOT NULL,
    reaction_type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_url, reaction_type)
  );

CREATE TABLE
  newsletter_subscriber (
    id INTEGER PRIMARY KEY,
    count INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  fathom_api_calls (
    id INTEGER PRIMARY KEY,
    calling_function TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    parameters TEXT,
    call_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  visitors (
    id INTEGER PRIMARY KEY,
    client_address TEXT,
    pathname TEXT,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  user_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    session_duration INTEGER,
    page_count INTEGER DEFAULT 0
  );

CREATE TABLE
  current_visitors (
    session_id INTEGER NOT NULL,
    page_slug TEXT NOT NULL,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, page_slug)
  );