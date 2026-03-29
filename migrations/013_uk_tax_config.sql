-- Create uk_tax_config if it doesn't exist (fresh DBs get it from 012,
-- but DBs that ran the original 012 before it was updated need this).

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
