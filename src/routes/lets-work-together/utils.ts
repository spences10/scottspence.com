export const locale_string = (number: number) =>
  number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })

export const billable_days = (
  working_days_in_year: number,
  holidays: number = 0,
  public_holidays: number = 0,
) => working_days_in_year - (holidays + public_holidays)

export const calculate_day_rate_with_pto = (
  annual_rate: number,
  working_days_in_year: number,
  holidays: number = 0,
  public_holidays: number = 0,
) => {
  const total_billable_days = billable_days(
    working_days_in_year,
    holidays,
    public_holidays,
  )
  return annual_rate / total_billable_days
}

export const calculate_day_rate_without_pto = (
  annual_rate: number,
  working_days_in_year: number,
) => {
  return annual_rate / working_days_in_year
}

export const convert_currency = (amount: number, rate: number) => {
  return amount * rate
}
