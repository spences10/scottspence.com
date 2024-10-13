export const locale_string = (number: number) =>
	number.toLocaleString(undefined, {
		maximumFractionDigits: 0,
	})

export const billable_days = (
	working_days_in_year: number,
	pto_days: number = 0,
	public_holidays: number = 0,
) => working_days_in_year - (pto_days + public_holidays)

export const calculate_day_rate_with_pto = (
	annual_rate: number,
	working_days_in_year: number,
	pto_days: number = 0,
	public_holidays: number = 0,
) => {
	const total_billable_days = billable_days(
		working_days_in_year,
		pto_days,
		public_holidays,
	)
	return annual_rate / total_billable_days
}

export const calculate_annual_rate_with_pto = (
	annual_rate: number,
	working_days_in_year: number,
	pto_days: number,
	public_holidays: number = 0,
) => {
	const day_rate = calculate_day_rate_with_pto(
		annual_rate,
		working_days_in_year,
		pto_days,
		public_holidays,
	)
	const total_working_days_with_pto = working_days_in_year + pto_days
	return day_rate * total_working_days_with_pto
}

export const calculate_monthly_rate_with_pto = (
	annual_rate: number,
	working_days_in_year: number,
	pto_days: number,
	public_holidays: number = 0,
) => {
	const annual = calculate_annual_rate_with_pto(
		annual_rate,
		working_days_in_year,
		pto_days,
		public_holidays,
	)
	return annual / 12
}
