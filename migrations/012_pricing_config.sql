-- Create pricing_config table with GBP day rate as single source of truth
-- Replaces pricing_numbers (EUR annual rate) with a simpler model:
-- one day rate in GBP, everything else derived

CREATE TABLE IF NOT EXISTS
  pricing_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_rate_gbp REAL NOT NULL DEFAULT 575,
    ir35_uplift_pct REAL NOT NULL DEFAULT 25,
    working_days_in_year INTEGER NOT NULL DEFAULT 252,
    public_holidays INTEGER NOT NULL DEFAULT 8,
    default_pto_days INTEGER NOT NULL DEFAULT 30,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT INTO
  pricing_config (
    day_rate_gbp,
    ir35_uplift_pct,
    working_days_in_year,
    public_holidays,
    default_pto_days
  )
SELECT
  575, 25, 252, 8, 30
WHERE
  NOT EXISTS (SELECT 1 FROM pricing_config);

-- UK tax bands and rates - stored in DB so they can be updated
-- without a code deploy when HMRC changes rates.
-- NOTE: Review annually around March/April budget.
-- Current rates: 2025/26 tax year (frozen to April 2028).
CREATE TABLE IF NOT EXISTS
  uk_tax_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_year TEXT NOT NULL DEFAULT '2025/26',
    -- Income tax
    personal_allowance REAL NOT NULL DEFAULT 12570,
    personal_allowance_taper_start REAL NOT NULL DEFAULT 100000,
    basic_rate_ceiling REAL NOT NULL DEFAULT 50270,
    higher_rate_ceiling REAL NOT NULL DEFAULT 125140,
    basic_rate REAL NOT NULL DEFAULT 0.20,
    higher_rate REAL NOT NULL DEFAULT 0.40,
    additional_rate REAL NOT NULL DEFAULT 0.45,
    -- Employee NI
    ni_primary_threshold REAL NOT NULL DEFAULT 12570,
    ni_upper_earnings_limit REAL NOT NULL DEFAULT 50270,
    ni_main_rate REAL NOT NULL DEFAULT 0.08,
    ni_upper_rate REAL NOT NULL DEFAULT 0.02,
    -- Corporation tax and dividends (Ltd company route)
    corporation_tax_rate REAL NOT NULL DEFAULT 0.25,
    dividend_allowance REAL NOT NULL DEFAULT 500,
    dividend_basic_rate REAL NOT NULL DEFAULT 0.0875,
    dividend_higher_rate REAL NOT NULL DEFAULT 0.3375,
    basic_rate_band REAL NOT NULL DEFAULT 37700,
    --
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT INTO
  uk_tax_config (tax_year)
SELECT
  '2025/26'
WHERE
  NOT EXISTS (SELECT 1 FROM uk_tax_config);

-- Clear stale EUR-based exchange rates; will re-fetch with GBP base
DELETE FROM exchange_rates;
