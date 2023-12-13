SELECT
  SUBSTR (parameters, LENGTH (parameters) / 2 + 1) AS parameters,
  COUNT(*) as count
FROM
  fathom_api_calls
WHERE
  date (call_timestamp) = date ('now', '-1 day')
GROUP BY
  parameters
HAVING
  COUNT(*) > 1;

INSERT INTO
  pricing_numbers (
    annual_rate_eur,
    chosen_holidays,
    public_holidays,
    working_days_in_year
  )
VALUES
  (120200, 30, 8, 252);

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