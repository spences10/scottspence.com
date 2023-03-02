import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { slug } = params
  const base_path = `../analytics.json?pathname=/posts/${slug}`

  const day_start = startOfDay(new Date()).toISOString()
  const day_end = endOfDay(new Date()).toISOString()

  const month_start = startOfMonth(new Date()).toISOString()
  const month_end = endOfMonth(new Date()).toISOString()

  const year_start = startOfYear(new Date()).toISOString()
  const year_end = endOfYear(new Date()).toISOString()

  // get hourly visits
  const fetch_hourly_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${day_start}&date_to=${day_end}&date_grouping=hour&sort_by=timestamp:asc`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get daily visits
  const fetch_daily_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${day_start}&date_to=${day_end}`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get monthly visits
  const fetch_monthly_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${month_start}&date_to=${month_end}&date_grouping=month`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get yearly visits
  const fetch_yearly_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${year_start}&date_to=${year_end}&date_grouping=year`
    )
    const { analytics } = await res.json()
    return analytics
  }

  return {
    hourly_visits: fetch_hourly_visits(),
    daily_visits: fetch_daily_visits(),
    monthly_visits: fetch_monthly_visits(),
    yearly_visits: fetch_yearly_visits(),
  }
}
