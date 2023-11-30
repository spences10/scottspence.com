import { turso_client } from '$lib/turso/client.js'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'
import { differenceInMinutes } from 'date-fns'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({
  getClientAddress,
  url,
}): Promise<Response> => {
  const client_address = getClientAddress()
  const slug = url.searchParams.get('slug') ?? '/'
  const client = turso_client()

  try {
    // Match clientAddress and pathname within the last 5 minutes
    const last_visit_result = await client.execute({
      sql: 'SELECT last_visit FROM visitors WHERE client_address = ? ORDER BY last_visit DESC LIMIT 1;',
      args: [client_address],
    })

    const now = new Date()

    if (
      !last_visit_result.rows.length ||
      differenceInMinutes(
        now,
        new Date(String(last_visit_result.rows[0].last_visit)),
      ) >= 1
    ) {
      // Insert or update visitor data
      await client.execute({
        sql: 'INSERT INTO visitors (client_address, pathname) VALUES (?, ?) ON CONFLICT (client_address, pathname) DO UPDATE SET count = count + 1, last_visit = CURRENT_TIMESTAMP;',
        args: [client_address, slug],
      })
    }

    // Fetch the total visitor count along with titles of the posts/pages being viewed
    const visitor_data_result = await client.execute(
      'SELECT v.pathname, p.title, SUM(v.count) AS total_visitors FROM visitors v LEFT JOIN posts p ON v.pathname = p.slug WHERE v.last_visit >= datetime("now", "-15 minutes") GROUP BY v.pathname;',
    )

    const visitor_data = visitor_data_result.rows.map(row => ({
      pathname: row.pathname,
      title: row.title || 'Unknown',
      total_visitors: row.total_visitors,
    }))

    return json({ visitor_data: visitor_data })
  } catch (error) {
    console.error('Error:', error)
    return json({ visitor_data: [] })
  }
}
