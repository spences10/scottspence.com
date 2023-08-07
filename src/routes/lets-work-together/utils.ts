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

export const convert_currency = (amount: number, rate: number) => {
  return amount * rate
}
