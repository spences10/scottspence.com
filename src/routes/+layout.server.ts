import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom/fetch-fathom-data.js'
import { turso_client } from '$lib/turso/client.js'
import type { Client } from '@libsql/client/http'
import { differenceInHours, formatISO, parseISO } from 'date-fns'

const insert_fathom_data_into_turso = async (
  client: Client,
  data: PopularPost[],
  period: string,
) => {
  const insert_query = `
    INSERT INTO popular_posts (pathname, title, pageviews, visits, date_grouping)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(pathname, date_grouping) DO UPDATE SET
      title = excluded.title,
      pageviews = excluded.pageviews,
      visits = excluded.visits,
      last_updated = CURRENT_TIMESTAMP;
  `
  for (const post of data) {
    await client.execute({
      sql: insert_query,
      args: [
        post.pathname ?? 'Default Path',
        post.title,
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

const fetch_popular_posts = async (fetch: Fetch, period: string) => {
  const client = turso_client()
  let popular_posts: PopularPost[] = []

  try {
    // Check Turso first for data from the last 24 hours
    const last_update_result = await client.execute({
      sql: 'SELECT last_updated FROM popular_posts WHERE date_grouping = ? ORDER BY last_updated DESC LIMIT 1;',
      args: [period],
    })

    const last_update = last_update_result.rows[0] as unknown as {
      last_updated: string
    }

    if (
      last_update &&
      differenceInHours(
        new Date(),
        parseISO(last_update.last_updated),
      ) < 24
    ) {
      // Data is fresh enough, retrieve from Turso DB
      const cached_popular_posts_result = await client.execute({
        sql: 'SELECT * FROM popular_posts WHERE date_grouping = ? ORDER BY pageviews DESC;',
        args: [period],
      })

      popular_posts =
        cached_popular_posts_result.rows as unknown as PopularPost[]
    } else {
      // Fetch data from Fathom
      const date_from = formatISO(new Date(), {
        representation: 'date',
      })
      const fathom_data = await fetch_fathom_data(
        fetch,
        'aggregations',
        {
          entity: 'pageview',
          entity_id: PUBLIC_FATHOM_ID,
          aggregates: 'visits,pageviews',
          field_grouping: 'pathname',
          date_from,
          date_to: formatISO(new Date()),
          sort_by: 'pageviews:desc',
          limit: '15',
        },
      )

      if (fathom_data && Array.isArray(fathom_data)) {
        const transformed_data = fathom_data.map(data => ({
          pathname: data.pathname,
          title: 'Default Title',
          pageviews: parseInt(data.pageviews),
          visits: parseInt(data.visits),
        }))

        await insert_fathom_data_into_turso(
          client,
          transformed_data,
          period,
        )
        popular_posts = transformed_data as unknown as PopularPost[]
      }
    }
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
  }

  return popular_posts
}

export const load = async ({ fetch }) => {
  // Fetch Popular Posts
  const popular_posts_promises = ['day', 'month', 'year'].map(
    period => fetch_popular_posts(fetch, period),
  )

  // Fetch Visitors
  const visitors_promise = fetch(`../current-visitors.json`)

  // Fetch newsletter subscriber count
  const subscribers_promise = fetch(`../subscribers.json`)

  const [
    popular_posts_daily,
    popular_posts_monthly,
    popular_posts_yearly,
  ] = await Promise.all(popular_posts_promises)

  const visitors_response = await visitors_promise
  const visitors = await visitors_response.json()

  const subscribers_response = await subscribers_promise
  const { newsletter_subscriber_count } =
    await subscribers_response.json()

  return {
    visitors,
    popular_posts: {
      popular_posts_daily,
      popular_posts_monthly,
      popular_posts_yearly,
    },
    newsletter_subscriber_count,
  }
}
