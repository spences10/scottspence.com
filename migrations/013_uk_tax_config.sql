-- Remove salary_equivalent_gbp/salary_multiplier from pricing_config
-- (now calculated from uk_tax_config bands instead of stored)
-- and create uk_tax_config table for HMRC tax rates.

-- Drop the old column (salary_multiplier from 012, or salary_equivalent_gbp
-- if 012 was re-run). SQLite 3.35+ supports ALTER TABLE DROP COLUMN.
ALTER TABLE pricing_config DROP COLUMN salary_multiplier;

-- UK tax bands and rates - stored in DB so they can be updated
-- without a code deploy when HMRC changes rates.
-- NOTE: Review annually around March/April budget.
-- Current rates: 2025/26 tax year (frozen to April 2028).
CREATE TABLE IF NOT EXISTS
  uk_tax_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_year TEXT NOT NULL DEFAULT '2025/26',
    personal_allowance REAL NOT NULL DEFAULT 12570,
    personal_allowance_taper_start REAL NOT NULL DEFAULT 100000,
    basic_rate_ceiling REAL NOT NULL DEFAULT 50270,
    higher_rate_ceiling REAL NOT NULL DEFAULT 125140,
    basic_rate REAL NOT NULL DEFAULT 0.20,
    higher_rate REAL NOT NULL DEFAULT 0.40,
    additional_rate REAL NOT NULL DEFAULT 0.45,
    ni_primary_threshold REAL NOT NULL DEFAULT 12570,
    ni_upper_earnings_limit REAL NOT NULL DEFAULT 50270,
    ni_main_rate REAL NOT NULL DEFAULT 0.08,
    ni_upper_rate REAL NOT NULL DEFAULT 0.02,
    corporation_tax_rate REAL NOT NULL DEFAULT 0.25,
    dividend_allowance REAL NOT NULL DEFAULT 500,
    dividend_basic_rate REAL NOT NULL DEFAULT 0.0875,
    dividend_higher_rate REAL NOT NULL DEFAULT 0.3375,
    basic_rate_band REAL NOT NULL DEFAULT 37700,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT INTO
  uk_tax_config (tax_year)
SELECT
  '2025/26'
WHERE
  NOT EXISTS (SELECT 1 FROM uk_tax_config);
