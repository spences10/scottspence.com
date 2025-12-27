-- SQLite Schema with sqlite-vec extension
-- Migration from Turso to local SQLite

-- Core tables (unchanged from Turso schema)
CREATE TABLE IF NOT EXISTS
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

CREATE TABLE IF NOT EXISTS
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

CREATE TABLE IF NOT EXISTS
  popular_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    date_grouping TEXT NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pathname, date_grouping)
  );

-- Analytics and aggregation tables
CREATE TABLE IF NOT EXISTS
  analytics_all_time (
    pathname TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  analytics_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    year_month TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pathname, year_month)
  );

CREATE TABLE IF NOT EXISTS
  analytics_yearly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    year TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pathname, year)
  );

-- Other tables
CREATE TABLE IF NOT EXISTS
  pricing_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    annual_rate_eur INTEGER,
    chosen_holidays INTEGER,
    public_holidays INTEGER,
    working_days_in_year INTEGER,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT OR IGNORE INTO
  pricing_numbers (
    annual_rate_eur,
    chosen_holidays,
    public_holidays,
    working_days_in_year
  )
VALUES
  (120200, 30, 8, 252);

CREATE TABLE IF NOT EXISTS
  exchange_rates (
    id INTEGER PRIMARY KEY,
    currency_code TEXT NOT NULL UNIQUE,
    rate REAL NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  reactions (
    id INTEGER PRIMARY KEY,
    post_url TEXT NOT NULL CHECK (
      post_url LIKE '/posts/%'
      AND post_url NOT LIKE '%[^a-zA-Z0-9/-]%'
    ),
    reaction_type TEXT NOT NULL CHECK (
      reaction_type IN ('likes', 'hearts', 'poops', 'parties')
    ),
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_url, reaction_type)
  );

CREATE TABLE IF NOT EXISTS
  newsletter_subscriber (
    id INTEGER PRIMARY KEY,
    count INTEGER NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  newsletters_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscriber_count INTEGER,
    resend_broadcast_id TEXT
  );

CREATE TABLE IF NOT EXISTS
  fathom_api_calls (
    id INTEGER PRIMARY KEY,
    calling_function TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    parameters TEXT,
    call_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  visitors (
    id INTEGER PRIMARY KEY,
    client_address TEXT,
    pathname TEXT,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  current_visitors (
    session_id INTEGER NOT NULL,
    page_slug TEXT NOT NULL,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, page_slug)
  );

CREATE TABLE IF NOT EXISTS
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

CREATE TABLE IF NOT EXISTS
  related_posts (
    post_id TEXT PRIMARY KEY,
    related_post_ids TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- ** CHANGED: Vector embeddings using sqlite-vec **
-- This replaces the Turso F32_BLOB implementation
CREATE VIRTUAL TABLE IF NOT EXISTS post_embeddings USING vec0(
  post_id TEXT PRIMARY KEY,
  embedding FLOAT[1024]
);

-- Analytics summary tables (Fathom exports)
CREATE TABLE IF NOT EXISTS
  analytics_browsers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    browser TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  analytics_browsers_summary (
    browser TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    year_month TEXT NOT NULL,
    PRIMARY KEY (browser, year_month)
  );

CREATE TABLE IF NOT EXISTS
  analytics_countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    country TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  analytics_countries_summary (
    country TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    year_month TEXT NOT NULL,
    PRIMARY KEY (country, year_month)
  );

CREATE TABLE IF NOT EXISTS
  analytics_device_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    device_type TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  analytics_device_types_summary (
    device_type TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    year_month TEXT NOT NULL,
    PRIMARY KEY (device_type, year_month)
  );

CREATE TABLE IF NOT EXISTS
  analytics_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    hostname TEXT NOT NULL,
    pathname TEXT NOT NULL,
    views INTEGER NOT NULL,
    uniques INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  analytics_referrers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    referrer_hostname TEXT NOT NULL,
    referrer_pathname TEXT NOT NULL,
    views INTEGER NOT NULL,
    visits INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  analytics_referrers_summary (
    referrer_hostname TEXT NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    year_month TEXT NOT NULL,
    PRIMARY KEY (referrer_hostname, year_month)
  );

CREATE TABLE IF NOT EXISTS
  analytics_site (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    pageviews INTEGER NOT NULL,
    visits INTEGER NOT NULL,
    avg_duration REAL NOT NULL,
    bounce_rate REAL NOT NULL
  );

-- GitHub Activity tables for newsletter generation
CREATE TABLE IF NOT EXISTS
  github_commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sha TEXT NOT NULL UNIQUE,
    repo TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  github_pull_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TEXT NOT NULL,
    merged_at TEXT,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (repo, number)
  );

CREATE TABLE IF NOT EXISTS
  github_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TEXT NOT NULL,
    closed_at TEXT,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (repo, number)
  );

CREATE TABLE IF NOT EXISTS
  github_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    name TEXT NOT NULL,
    published_at TEXT NOT NULL,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (repo, tag_name)
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_popular_posts_date_grouping_pageviews ON popular_posts (date_grouping, pageviews DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_pathname ON analytics_monthly (pathname);
CREATE INDEX IF NOT EXISTS idx_monthly_year_month ON analytics_monthly (year_month);
CREATE INDEX IF NOT EXISTS idx_yearly_pathname ON analytics_yearly (pathname);
CREATE INDEX IF NOT EXISTS idx_yearly_year ON analytics_yearly (year);
CREATE INDEX IF NOT EXISTS idx_github_commits_date ON github_commits (date DESC);
CREATE INDEX IF NOT EXISTS idx_github_commits_repo ON github_commits (repo);
CREATE INDEX IF NOT EXISTS idx_github_prs_created ON github_pull_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_prs_repo ON github_pull_requests (repo);
CREATE INDEX IF NOT EXISTS idx_github_issues_created ON github_issues (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_issues_repo ON github_issues (repo);
CREATE INDEX IF NOT EXISTS idx_github_releases_published ON github_releases (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_releases_repo ON github_releases (repo);

-- Local analytics events (privacy-first, runs alongside Fathom)
-- Simple INSERT model - uniqueness via COUNT(DISTINCT visitor_hash) in queries
CREATE TABLE IF NOT EXISTS
  analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_hash TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_name TEXT,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip TEXT,
    country TEXT,
    browser TEXT,
    device_type TEXT,
    os TEXT,
    is_bot INTEGER DEFAULT 0,
    props TEXT,
    created_at INTEGER NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor ON analytics_events (visitor_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events (path);

-- Enable WAL mode for better concurrent access
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;