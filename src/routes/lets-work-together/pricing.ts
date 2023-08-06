// constants
export const ANNUAL_RATE_EUR = 85000
export const CHOSEN_HOLIDAYS = 30
export const PUBLIC_HOLIDAYS = 9
export const WORKING_DAYS_IN_YEAR = 252

// function to calculate day rate
export const calculate_day_rate = (annual_rate: number) =>
  annual_rate / WORKING_DAYS_IN_YEAR

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
) => total_annual_rate / WORKING_DAYS_IN_YEAR

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

// workshop constants
export const BASE_COST_5_OR_LESS =
  calculate_day_rate(ANNUAL_RATE_EUR) * 2
export const ADDITIONAL_COST_6_TO_10 =
  calculate_day_rate(ANNUAL_RATE_EUR) * 0.5
export const ADDITIONAL_COST_11_TO_15 = ADDITIONAL_COST_6_TO_10 * 0.9
export const ADDITIONAL_COST_16_TO_20 = ADDITIONAL_COST_11_TO_15 * 0.9

// Calculate workshop cost based on attendees
export const calculate_workshop_cost = (attendees: number) => {
  if (attendees <= 5) {
    return BASE_COST_5_OR_LESS
  } else if (attendees <= 10) {
    return (
      BASE_COST_5_OR_LESS + (attendees - 5) * ADDITIONAL_COST_6_TO_10
    )
  } else if (attendees <= 15) {
    return (
      BASE_COST_5_OR_LESS +
      5 * ADDITIONAL_COST_6_TO_10 +
      (attendees - 10) * ADDITIONAL_COST_11_TO_15
    )
  } else {
    return (
      BASE_COST_5_OR_LESS +
      5 * ADDITIONAL_COST_6_TO_10 +
      5 * ADDITIONAL_COST_11_TO_15 +
      (attendees - 15) * ADDITIONAL_COST_16_TO_20
    )
  }
}

// Function to calculate price per attendee
export const calculate_price_per_attendee = (
  workshop_cost: number,
  attendees: number,
) => workshop_cost / attendees

// Function to calculate cost with customization
export const calculate_cost_with_customization = (
  base_cost: number,
  customization_percentage: number,
) => base_cost * (1 + customization_percentage)

export const VIDEO_DURATION = {
  Short: {
    description: '5-10 min',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 1.5,
  },
  Medium: {
    description: '10-20 min',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 2.5,
  },
  Long: {
    description: '20-30 min',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 3.6,
  },
  'Extra Long': {
    description: '>30 min',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 4.8,
  },
}

export const VIDEO_CUSTOMIZATION_PERCENTAGES = {
  None: 0,
  Minor: 0.3, // 30% extra
  Moderate: 0.5, // 50% extra
  Major: 1.1, // 110% extra
}

export const BLOG_POST_LENGTH = {
  Short: {
    description: '<1k words',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 1,
  },
  Medium: {
    description: '1k-2k words',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 2,
  },
  Long: {
    description: '>2k words',
    cost: calculate_day_rate(ANNUAL_RATE_EUR) * 3,
  },
}

export const BLOG_POST_DEPTH = {
  Overview: 0,
  'In-depth': 0.5, // 50% extra
  Series: 0.4, // 40% extra
}

// function to calculate cost with depth
export const calculate_cost_with_depth = (
  base_cost: number,
  depth_percentage: number,
) => base_cost * (1 + depth_percentage)
