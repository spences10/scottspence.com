import { time_to_seconds } from '$lib/utils'
import {
  endOfMonth,
  endOfYear,
  formatISO,
  startOfMonth,
  startOfYear,
  subDays,
} from 'date-fns'

type Fetch = (url: string) => Promise<Response>

function get_date_bounds(date: Date, start = true): string {
  const formatted_date = formatISO(date, { representation: 'date' })
  return start
    ? `${formatted_date}T00:00:00.000Z`
    : `${formatted_date}T23:59:59.999Z`
}

const fetch_visits = async (
  fetch: Fetch,
  base_path: string,
  date_from: string,
  date_to: string,
  date_grouping = '',
  cache_duration: number
): Promise<AnalyticsData> => {
  const url = `${base_path}&date_from=${date_from}&date_to=${date_to}&date_grouping=${date_grouping}&cache_duration=${cache_duration}`
  const res = await fetch(url)
  const { analytics } = await res.json()

  if (Array.isArray(analytics)) {
    return analytics.length > 0 ? analytics[0] : null
  } else {
    return analytics || null
  }
}

export const load = async ({ fetch, params }) => {
  const { slug } = params
  const base_path = `../analytics.json?pathname=/posts/${slug}`

  const now = new Date()
  const day_start = get_date_bounds(subDays(now, 1))
  const day_end = get_date_bounds(subDays(now, 1), false)

  const month_start = get_date_bounds(startOfMonth(now))
  const month_end = get_date_bounds(endOfMonth(now), false)

  const year_start = get_date_bounds(startOfYear(now))
  const year_end = get_date_bounds(endOfYear(now), false)

  const [daily_visits, monthly_visits, yearly_visits] =
    await Promise.all([
      fetch_visits(
        fetch,
        base_path,
        day_start,
        day_end,
        '',
        time_to_seconds({ hours: 24 })
      ),
      fetch_visits(
        fetch,
        base_path,
        month_start,
        month_end,
        'month',
        time_to_seconds({ hours: 24 })
      ),
      fetch_visits(
        fetch,
        base_path,
        year_start,
        year_end,
        'year',
        time_to_seconds({ hours: 24 })
      ),
    ])

  return {
    daily_visits,
    monthly_visits,
    yearly_visits,
  }
}
