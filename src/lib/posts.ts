import { differenceInHours, parseISO } from 'date-fns'
import { turso_client } from './turso'
import type { Client } from '@libsql/client/web'

// In-memory cache to store posts temporarily
const posts_cache = new Map()

export const get_posts = async (): Promise<{ posts: Post[] }> => {
  const client = turso_client()
  let sorted_posts: Post[] = []

  try {
    // Attempt to retrieve posts from in-memory cache
    const cached_posts = posts_cache.get('sorted_posts')
    if (
      cached_posts &&
      cached_posts.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ) {
      return { posts: cached_posts.data }
    }

    // Fetch the last post update time from the DB
    const last_post_result = await client.execute(
      'SELECT last_updated FROM posts ORDER BY date DESC LIMIT 1;',
    )
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
      const cached_posts_result = await client.execute(
        'SELECT * FROM posts ORDER BY date DESC;',
      )
      sorted_posts = cached_posts_result.rows as unknown as Post[]
      posts_cache.set('sorted_posts', {
        timestamp: Date.now(),
        data: sorted_posts,
      })
    }
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
  }

  if (!sorted_posts.length) {
    const posts: Post[] = await fetch_and_update_posts(client)

    // Update in-memory cache
    posts_cache.set('sorted_posts', {
      timestamp: Date.now(),
      data: posts,
    })
    sorted_posts = posts
  }

  return {
    posts: sorted_posts,
  }
}

async function fetch_and_update_posts(client: Client) {
  // Fetch posts from local Markdown files
  const posts: Post[] = await Promise.all(
    Object.entries(import.meta.glob('../../posts/**/*.md')).map(
      async ([path, resolver]) => {
        const resolved = (await resolver()) as { metadata: Post }
        const { metadata } = resolved
        const slug = path.split('/').pop()?.slice(0, -3) ?? ''
        return { ...metadata, slug }
      },
    ),
  )

  // Insert or update posts in the Turso DB
  for (const post of posts) {
    try {
      await client.execute({
        sql: `
            INSERT INTO posts (
              date, is_private, preview, preview_html, 
              reading_time_minutes, reading_time_text, 
              reading_time_seconds, reading_time_words, slug, tags, title, 
              last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (slug) DO UPDATE SET 
              date = EXCLUDED.date,
              is_private = EXCLUDED.is_private,
              preview = EXCLUDED.preview,
              preview_html = EXCLUDED.preview_html,
              reading_time_minutes = EXCLUDED.reading_time_minutes,
              reading_time_text = EXCLUDED.reading_time_text,
              reading_time_seconds = EXCLUDED.reading_time_seconds,
              reading_time_words = EXCLUDED.reading_time_words,
              tags = EXCLUDED.tags,
              title = EXCLUDED.title,
              last_updated = EXCLUDED.last_updated;
          `,
        args: [
          new Date(post.date).toISOString(),
          post.isPrivate,
          post.preview,
          post.previewHtml,
          post.readingTime.minutes,
          post.readingTime.text,
          post.readingTime.time,
          post.readingTime.words,
          post.slug,
          post.tags.join(','),
          post.title,
          new Date().toISOString(),
        ],
      })
    } catch (error) {
      console.error('Error inserting post into Turso DB:', error)
    }
  }

  // Fetch and return updated posts
  try {
    const updated_posts_result = await client.execute(
      'SELECT * FROM posts ORDER BY date DESC;',
    )
    return updated_posts_result.rows as unknown as Post[]
  } catch (error) {
    console.error(
      'Error fetching updated posts from Turso DB:',
      error,
    )
    return []
  }
}
