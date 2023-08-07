export const locale_string = (number: number) =>
  number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })

export const calculate_day_rate = (
  annual_rate: number,
  working_days_in_year: number | undefined,
) => {
  if (working_days_in_year === undefined) {
    return 0
  }
  return annual_rate / working_days_in_year
}

export const calculate_cost_with_holidays = (
  day_rate: number,
  holidays: number,
  public_holidays: number,
) => day_rate * (holidays + public_holidays)

export const calculate_total_annual_rate_with_holidays = (
  annual_rate: number,
  cost_with_holidays: number,
) => annual_rate + cost_with_holidays

export const calculate_day_rate_including_holidays = (
  total_annual_rate: number,
  working_days_in_year: number,
) => total_annual_rate / working_days_in_year

export const convert_currency = (amount: number, rate: number) => {
  return amount * rate
}
