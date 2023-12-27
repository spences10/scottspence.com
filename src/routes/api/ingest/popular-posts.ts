import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { turso_client } from '$lib/turso'
import type { Client } from '@libsql/client/web'
import {
  differenceInHours,
  endOfDay,
  endOfMonth,
  endOfYear,
  formatISO,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

const get_date_range = (period: string) => {
  const now = new Date()
  switch (period) {
    case 'day':
      return [formatISO(startOfDay(now)), formatISO(endOfDay(now))]
    case 'month':
      return [
        formatISO(startOfMonth(now)),
        formatISO(endOfMonth(now)),
      ]
    case 'year':
      return [formatISO(startOfYear(now)), formatISO(endOfYear(now))]
    default:
      throw new Error(`Unknown period: ${period}`)
  }
}

const insert_fathom_data_into_turso = async (
  client: Client,
  data: PopularPost[],
  period: string,
) => {
  const insert_query = `
    INSERT INTO popular_posts (pathname, pageviews, visits, date_grouping)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(pathname, date_grouping) DO UPDATE SET
      pageviews = excluded.pageviews,
      visits = excluded.visits,
      last_updated = CURRENT_TIMESTAMP;
  `
  for (const post of data) {
    await client.execute({
      sql: insert_query,
      args: [
        post.pathname,
        Number.isInteger(post.pageviews)
          ? post.pageviews
          : parseInt(post.pageviews),
        Number.isInteger(post.visits)
          ? post.visits
          : parseInt(post.visits),
        period,
      ],
    })
  }
}

export const update_popular_posts = async (
  fetch: Fetch,
  period: string,
) => {
  const client = turso_client()

  try {
    // Check Turso first for data from the last 24 hours
    const last_update_result = await client.execute({
      sql: 'SELECT last_updated FROM popular_posts WHERE date_grouping = ? ORDER BY last_updated DESC LIMIT 1;',
      args: [period],
    })

    const last_update = last_update_result.rows[0]
      ?.last_updated as string

    // Determine if the data is older than 24 hours
    if (
      !last_update ||
      differenceInHours(new Date(), parseISO(last_update)) >= 24
    ) {
      // Data is older than 24 hours or not present, fetch from Fathom
      const [date_from, date_to] = get_date_range(period)
      const fathom_data = await fetch_fathom_data(
        fetch,
        'aggregations',
        {
          entity: 'pageview',
          entity_id: PUBLIC_FATHOM_ID,
          aggregates: 'visits,pageviews',
          field_grouping: 'pathname',
          date_from,
          date_to,
          sort_by: 'pageviews:desc',
          limit: '100',
        },
        `fetch_popular_posts_${period}`,
      )

      if (fathom_data && Array.isArray(fathom_data)) {
        const transformed_data = fathom_data.map(data => ({
          pathname: data.pathname,
          title: 'Default Title', // Adjust as needed
          pageviews: data.pageviews,
          visits: data.visits,
        }))

        // Update Turso database with new data
        await insert_fathom_data_into_turso(
          client,
          transformed_data,
          period,
        )
      }
    } else {
      console.log(
        `Data for period ${period} is fresh. No update needed.`,
      )
    }
  } catch (error) {
    console.error('Error updating popular posts:', error)
  }

  // No return needed, as the function's purpose is just to update the database.
}
