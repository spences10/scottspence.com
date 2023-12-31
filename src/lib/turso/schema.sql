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

SELECT
  pp.id,
  pp.pathname,
  p.title,
  pp.pageviews,
  pp.visits,
  pp.date_grouping,
  pp.last_updated
FROM
  popular_posts pp
  JOIN posts p ON pp.pathname = '/posts/' || p.slug;

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

SELECT
  SUBSTR(parameters, LENGTH(parameters)/2 + 1) AS parameters,
  COUNT(*) as count
FROM
  fathom_api_calls
WHERE
  date (call_timestamp) = date ('now', '-1 day')
GROUP BY
  parameters
HAVING
  COUNT(*) > 1;

-- check turso calls
WITH Total_Calls AS (
  SELECT
    'Total Calls' AS Metric,
    COUNT(*) AS Value
  FROM
    fathom_api_calls
),
Frequent_Functions AS (
  SELECT
    'Frequent Function' AS Metric,
    calling_function || ' (' || COUNT(*) || ' calls)' AS Value
  FROM
    fathom_api_calls
  GROUP BY
    calling_function
  ORDER BY
    COUNT(*) DESC
  LIMIT 1
),
Used_Endpoints AS (
  SELECT
    'Most Used Endpoint' AS Metric,
    endpoint || ' (' || COUNT(*) || ' hits)' AS Value
  FROM
    fathom_api_calls
  GROUP BY
    endpoint
  ORDER BY
    COUNT(*) DESC
  LIMIT 1
),
Calls_Over_Time AS (
  SELECT
    'Calls Over Time' AS Metric,
    DATE(call_timestamp) || ' (' || COUNT(*) || ' calls)' AS Value
  FROM
    fathom_api_calls
  GROUP BY
    DATE(call_timestamp)
),
Hourly_Patterns AS (
  SELECT
    'Hourly Patterns' AS Metric,
    strftime('%H', call_timestamp) || ' (' || COUNT(*) || ' calls)' AS Value
  FROM
    fathom_api_calls
  GROUP BY
    strftime('%H', call_timestamp)
),
Unique_Functions_Per_Day AS (
  SELECT
    'Unique Functions Per Day' AS Metric,
    DATE(call_timestamp) || ' (' || COUNT(DISTINCT calling_function) || ' functions)' AS Value
  FROM
    fathom_api_calls
  GROUP BY
    DATE(call_timestamp)
),
Parameters_Analysis AS (
  SELECT
    'Parameters Analysis' AS Metric,
    parameters || ' (' || COUNT(*) || ' times)' AS Value
  FROM
    fathom_api_calls
  WHERE
    parameters IS NOT NULL
  GROUP BY
    parameters
  ORDER BY
    COUNT(*) DESC
  LIMIT 1
),
Recent_Activity AS (
  SELECT
    'Recent Activity' AS Metric,
    id || ': ' || calling_function || ' at ' || call_timestamp AS Value
  FROM
    fathom_api_calls
  ORDER BY
    call_timestamp DESC
  LIMIT 10
)
SELECT * FROM Total_Calls
UNION ALL
SELECT * FROM Frequent_Functions
UNION ALL
SELECT * FROM Used_Endpoints
UNION ALL
SELECT * FROM Calls_Over_Time
UNION ALL
SELECT * FROM Hourly_Patterns
UNION ALL
SELECT * FROM Unique_Functions_Per_Day
UNION ALL
SELECT * FROM Parameters_Analysis
UNION ALL
SELECT * FROM Recent_Activity
ORDER BY Metric;  -- Modify as needed based on what you want to order by

