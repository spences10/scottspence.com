// constants
export const ANNUAL_RATE_EUR = 85000
export const CHOSEN_HOLIDAYS = 30
export const PUBLIC_HOLIDAYS = 9
export const WORKING_DAYS = 252

// function to calculate day rate
export const calculate_day_rate = (annual_rate: number) =>
  annual_rate / WORKING_DAYS

// function to calculate cost with holidays
export const calculate_cost_with_holidays = (
  day_rate: number,
  holidays: number,
) => day_rate * (holidays + PUBLIC_HOLIDAYS)

// function to calculate total annual rate including holidays
export const calculate_total_annual_rate = (
  annual_rate: number,
  cost_with_holidays: number,
) => annual_rate + cost_with_holidays

// function to calculate day rate including holidays
export const calculate_day_rate_including_holidays = (
  total_annual_rate: number,
) => total_annual_rate / WORKING_DAYS

// Function to convert EUR to USD for illustration
export const convert_EUR_to_USD = (amount: number) => amount * 1.18

// Function to convert currency
export const convert_currency = (
  amount: number,
  currency: string,
) => {
  if (currency === 'USD') {
    return convert_EUR_to_USD(amount)
  }

  return amount
}
