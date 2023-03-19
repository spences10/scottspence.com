import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import type { PageServerLoad } from './$types'

const fetch_visits = async (
  fetch: {
    (
      input: RequestInfo | URL,
      init?: RequestInit | undefined
    ): Promise<Response>
    (arg0: string): any
  },
  base_path: string,
  date_from: string,
  date_to: string,
  date_grouping: string = ''
) => {
  const url = `${base_path}&date_from=${date_from}&date_to=${date_to}&date_grouping=${date_grouping}`
  const res = await fetch(url)
  const { analytics } = await res.json()
  return analytics
}

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { slug } = params
  const base_path = `../analytics.json?pathname=/posts/${slug}`

  const now = new Date()
  const day_start = startOfDay(now).toISOString()
  const day_end = endOfDay(now).toISOString()

  const month_start = startOfMonth(now).toISOString()
  const month_end = endOfMonth(now).toISOString()

  const year_start = startOfYear(now).toISOString()
  const year_end = endOfYear(now).toISOString()

  const [daily_visits, monthly_visits, yearly_visits] =
    await Promise.all([
      fetch_visits(fetch, base_path, day_start, day_end),
      fetch_visits(fetch, base_path, month_start, month_end, 'month'),
      fetch_visits(fetch, base_path, year_start, year_end, 'year'),
    ])

  return {
    analytics: {
      daily_visits,
      monthly_visits,
      yearly_visits,
    },
  }
}
