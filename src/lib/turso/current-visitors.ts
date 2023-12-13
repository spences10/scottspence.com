import type { Value } from '@libsql/client/web'
import { turso_client } from './client'

export const current_visitors = async (
  session_id: Value,
  page_slug: Value,
) => {
  // Log the page visit in current_visitors
  const client = turso_client()
  let sql = `
    INSERT INTO current_visitors (session_id, page_slug, last_visit)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT (session_id, page_slug) DO UPDATE SET
    last_visit = CURRENT_TIMESTAMP;
  `
  await client.execute({
    sql,
    args: [session_id, page_slug],
  })

  // Delete old records
  sql = `
    DELETE FROM current_visitors
    WHERE last_visit < DATETIME('now', '-24 hours')
      OR session_id NOT IN (SELECT id FROM user_session);
  `
  await client.execute(sql)
}
