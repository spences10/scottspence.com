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

-- stats
WITH TotalPosts AS (
    SELECT
        'Total Posts' AS stat,
        COUNT(*) AS value,
        '' AS extra1,
        '' AS extra2
    FROM posts
),
AverageReadingTime AS (
    SELECT
        'Average Reading Time (minutes)' AS stat,
        AVG(reading_time_minutes) AS value,
        '' AS extra1,
        '' AS extra2
    FROM posts
),
PrivatePublicPosts AS (
    SELECT
        'Private Posts' AS stat,
        SUM(CASE WHEN is_private = 1 THEN 1 ELSE 0 END) AS value,
        'Public Posts' AS extra1,
        SUM(CASE WHEN is_private = 0 THEN 1 ELSE 0 END) AS extra2
    FROM posts
),
TotalPageviewsVisits AS (
    SELECT
        'Total Pageviews' AS stat,
        SUM(pageviews) AS value,
        'Total Visits' AS extra1,
        SUM(visits) AS extra2
    FROM post_analytics
),
UniqueVisitors AS (
    SELECT
        'Unique Visitors' AS stat,
        SUM(uniques) AS value,
        '' AS extra1,
        '' AS extra2
    FROM post_analytics
),
BounceRate AS (
    SELECT
        'Average Bounce Rate' AS stat,
        AVG(bounce_rate) AS value,
        '' AS extra1,
        '' AS extra2
    FROM post_analytics
    WHERE bounce_rate IS NOT NULL
),
PopularPosts AS (
    SELECT
        'Popular Post Title' AS stat,
        p.title AS value,
        'Pageviews' AS extra1,
        pp.pageviews AS extra2
    FROM popular_posts pp
    JOIN posts p ON pp.pathname = '/posts/' || p.slug
    ORDER BY pp.pageviews DESC
    LIMIT 1 -- Adjust as needed; each row will be a separate entry in the union
),
TotalReactions AS (
    SELECT
        'Total Reactions (' || reaction_type || ')' AS stat,
        SUM(count) AS value,
        '' AS extra1,
        '' AS extra2
    FROM reactions
    GROUP BY reaction_type
)

SELECT * FROM TotalPosts
UNION ALL
SELECT * FROM AverageReadingTime
UNION ALL
SELECT * FROM PrivatePublicPosts
UNION ALL
SELECT * FROM TotalPageviewsVisits
UNION ALL
SELECT * FROM UniqueVisitors
UNION ALL
SELECT * FROM BounceRate
UNION ALL
SELECT * FROM PopularPosts
UNION ALL
SELECT * FROM TotalReactions;
