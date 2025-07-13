-- Core tables
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

-- Analytics and aggregation tables
CREATE TABLE
  analytics_all_time (
    pathname TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  analytics_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathname TEXT NOT NULL,
    year_month TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pathname, year_month)
  );

CREATE TABLE
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
CREATE TABLE
  pricing_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    annual_rate_eur INTEGER,
    chosen_holidays INTEGER,
    public_holidays INTEGER,
    working_days_in_year INTEGER,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT INTO
  pricing_numbers (
    annual_rate_eur,
    chosen_holidays,
    public_holidays,
    working_days_in_year
  )
VALUES
  (120200, 30, 8, 252);

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

-- Additional tables from live database
CREATE TABLE
  current_visitors (
    session_id INTEGER NOT NULL,
    page_slug TEXT NOT NULL,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, page_slug)
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
  related_posts (
    post_id TEXT PRIMARY KEY,
    related_post_ids TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  post_embeddings (
    post_id TEXT PRIMARY KEY,
    embedding F32_BLOB (1024)
  );

-- Performance indexes
CREATE INDEX idx_popular_posts_date_grouping_pageviews ON popular_posts (date_grouping, pageviews DESC);

CREATE INDEX idx_posts_slug ON posts (slug);

CREATE INDEX idx_monthly_pathname ON analytics_monthly (pathname);

CREATE INDEX idx_monthly_year_month ON analytics_monthly (year_month);

CREATE INDEX idx_yearly_pathname ON analytics_yearly (pathname);

CREATE INDEX idx_yearly_year ON analytics_yearly (year);

-- Sample query showing optimized approach
-- SELECT 
--   'day' AS period, 
--   pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
-- FROM popular_posts pp
-- JOIN posts p ON pp.pathname = '/posts/' || p.slug
-- WHERE pp.date_grouping = 'day'
-- ORDER BY pp.pageviews DESC
-- LIMIT 20;