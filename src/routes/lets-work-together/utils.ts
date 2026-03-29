export const locale_string = (number: number) =>
	number.toLocaleString(undefined, {
		maximumFractionDigits: 0,
	})

export const billable_days = (
	working_days_in_year: number,
	pto_days: number = 0,
	public_holidays: number = 0,
) => working_days_in_year - (pto_days + public_holidays)

const EUROZONE_COUNTRIES = new Set([
	'AT',
	'BE',
	'CY',
	'DE',
	'EE',
	'ES',
	'FI',
	'FR',
	'GR',
	'HR',
	'IE',
	'IT',
	'LT',
	'LU',
	'LV',
	'MT',
	'NL',
	'PT',
	'SI',
	'SK',
])

export const country_to_currency = (
	country: string | null,
): string => {
	if (!country) return 'USD'
	if (country === 'GB') return 'GBP'
	if (EUROZONE_COUNTRIES.has(country)) return 'EUR'
	return 'USD'
}
