import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const load = async ({ fetch, params }) => {
  const { slug } = params
  
  const week_start_date = startOfWeek(new Date(), {
    weekStartsOn: 1,
  }).toISOString()
  const week_end_date = endOfWeek(new Date(), {
    weekStartsOn: 1,
  }).toISOString()

  const day_start = startOfDay(new Date()).toISOString()
  const day_end = endOfDay(new Date()).toISOString()

  const month_start = startOfMonth(new Date()).toISOString()
  const month_end = endOfMonth(new Date()).toISOString()
  console.log('=====================')
  console.log(`week starts on`, week_start_date)
  console.log(`week ends on`, week_end_date)
  console.log(`day start`, day_start)
  console.log(`day end`, day_end)
  console.log(`month start`, month_start)
  console.log(`month end`, month_end)
  console.log('=====================')
  // get hourly visits
  // const fetch_hourly_visits = async () => {
  //   const res = await fetch(
  //     `../analytics.json?pathname=/posts/${slug}&date_from=${week_start_date.toISOString()}&date_to=${week_end_date.toISOString()}`
  //   )
  //   const { analytics } = await res.json()
  //   return analytics
  // }
  // get daily visits
  const fetch_daily_visits = async () => {
    const res = await fetch(
      `../analytics.json?pathname=/posts/${slug}&date_from=${day_start}&date_to=${day_end}`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get monthly visits
  const fetch_monthly_visits = async () => {
    const res = await fetch(
      `../analytics.json?pathname=/posts/${slug}`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get yearly visits
  const fetch_yearly_visits = async () => {
    const res = await fetch(
      `../analytics.json?pathname=/posts/${slug}`
    )
    const { analytics } = await res.json()
    return analytics
  }

  return {
    // hourly_visits: fetch_hourly_visits(),
    daily_visits: fetch_daily_visits(),
    // monthly_visits: fetch_monthly_visits(),
    // yearly_visits: fetch_yearly_visits(),
  }
}
