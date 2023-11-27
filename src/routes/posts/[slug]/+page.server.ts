import { turso_client } from '$lib/turso/client.js'
import { get_reaction_count_data } from '$lib/utils/get-reaction-count'
import {
  differenceInHours,
  endOfMonth,
  endOfYear,
  formatISO,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
} from 'date-fns'

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
  slug: string,
) => {
  let page_analytics: Post[] = []
  const client = turso_client()
  // check Turso first for data from the last 24 hours
  try {
    const last_post_result = await client.execute({
      sql: 'SELECT last_updated FROM post_analytics WHERE date_grouping = ? ORDER BY last_updated DESC LIMIT 1;',
      args: [date_grouping],
    })

    const last_post = last_post_result.rows[0] as unknown as {
      last_updated: string
    }

    if (
      last_post.last_updated &&
      differenceInHours(
        new Date(),
        parseISO(last_post.last_updated),
      ) < 24
    ) {
      // Data is fresh enough, retrieve from Turso DB
      const cached_post_analytics_result = await client.execute({
        sql: 'SELECT * FROM post_analytics WHERE date_grouping = ? AND slug = ? ORDER BY last_updated DESC;',
        args: [date_grouping, slug],
      })

      page_analytics =
        cached_post_analytics_result.rows as unknown as Post[]
    }
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
  }

  // if no data from Turso, fetch from Fathom
  if (page_analytics.length === 0) {
    const params = new URLSearchParams({
      date_from,
      date_to,
      date_grouping,
    })
    const url = `${base_path}&${params.toString()}`

    const res = await fetch(url)
    const { analytics } = await res.json()

    // Add data to Turso DB if fetched from Fathom
    if (Array.isArray(analytics) && analytics.length > 0) {
      try {
        await client.execute({
          sql: `
            INSERT INTO post_analytics (
              slug, date_grouping, pageviews, visits, uniques, avg_duration, bounce_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (slug, date_grouping) DO UPDATE SET 
              pageviews = EXCLUDED.pageviews,
              visits = EXCLUDED.visits,
              uniques = EXCLUDED.uniques,
              avg_duration = EXCLUDED.avg_duration,
              bounce_rate = EXCLUDED.bounce_rate;
          `,
          args: [
            slug,
            date_grouping,
            analytics[0].pageviews,
            analytics[0].visits,
            analytics[0].uniques,
            analytics[0].avg_duration,
            analytics[0].bounce_rate,
          ],
        })
      } catch (error) {
        console.error('Error inserting into Turso DB:', error)
      }
    }

    return analytics.length > 0 ? analytics[0] : null
  }

  // Return cached data from Turso DB
  return page_analytics
}

export const load = async ({ fetch, params, url }) => {
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
      fetch_visits(fetch, base_path, day_start, day_end, 'day', slug),
      fetch_visits(
        fetch,
        base_path,
        month_start,
        month_end,
        'month',
        slug,
      ),
      fetch_visits(
        fetch,
        base_path,
        year_start,
        year_end,
        'year',
        slug,
      ),
    ])

  const count = await get_reaction_count_data(url.pathname)

  return {
    daily_visits,
    monthly_visits,
    yearly_visits,
    count,
  }
}
