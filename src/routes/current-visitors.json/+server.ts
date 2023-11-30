import { turso_client } from '$lib/turso/client.js'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

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
    // Check if a record for this client_address and pathname already exists
    const existing_visit_result = await client.execute({
      sql: 'SELECT * FROM visitors WHERE client_address = ? AND pathname = ?;',
      args: [client_address, slug],
    })

    if (!existing_visit_result.rows.length) {
      // Insert a new record if it doesn't exist
      await client.execute({
        sql: 'INSERT INTO visitors (client_address, pathname, last_visit) VALUES (?, ?, CURRENT_TIMESTAMP);',
        args: [client_address, slug],
      })
    }

    // Fetch visitor count
    const visitor_data_result = await client.execute(
      'SELECT v.pathname, p.title, COUNT(*) AS recent_visitors FROM visitors v LEFT JOIN posts p ON v.pathname = p.slug WHERE v.last_visit >= datetime("now", "-15 minutes") GROUP BY v.pathname;',
    )

    const visitor_data = visitor_data_result.rows.map(row => ({
      pathname: row.pathname,
      title: row.title || 'Unknown',
      recent_visitors: row.recent_visitors,
    }))

    // Cleanup old visitors
    await client.execute(
      'DELETE FROM visitors WHERE last_visit < datetime("now", "-15 minutes");',
    )

    return json({ visitor_data: visitor_data })
  } catch (error) {
    console.error('Error:', error)
    return json({ visitor_data: [] })
  }
}
