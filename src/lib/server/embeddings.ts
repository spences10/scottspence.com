import {
	TURSO_DB_AUTH_TOKEN,
	TURSO_DB_URL,
	VOYAGEAI_API_KEY,
} from '$env/static/private'
import { createClient } from '@libsql/client'

const db = createClient({
	url: TURSO_DB_URL,
	authToken: TURSO_DB_AUTH_TOKEN,
})

const create_embedding = async (text: string): Promise<number[]> => {
	try {
		const response = await fetch(
			'https://api.voyageai.com/v1/embeddings',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${VOYAGEAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: 'voyage-3',
					input: text,
					input_type: 'document',
				}),
			},
		)
		if (!response.ok) {
			const errorBody = await response.text()
			throw new Error(
				`HTTP error! status: ${response.status}, body: ${errorBody}`,
			)
		}
		const data = await response.json()
		if (!data.data || !data.data[0] || !data.data[0].embedding) {
			throw new Error('Unexpected API response format')
		}
		return data.data[0].embedding
	} catch (error) {
		console.error('Error creating embedding:', error)
		throw error
	}
}

export const store_post_embedding = async (
	post_id: string,
	content: string,
) => {
	try {
		const embedding = await create_embedding(content)
		const embeddingString = JSON.stringify(embedding)

		await db.execute({
			sql: 'INSERT OR REPLACE INTO post_embeddings (post_id, embedding) VALUES (?, ?)',
			args: [post_id, embeddingString],
		})
	} catch (error) {
		console.error(
			`Error storing embedding for post ${post_id}:`,
			error,
		)
		throw error
	}
}

export const get_related_posts = async (
	post_id: string,
	limit: number = 5,
) => {
	try {
		const result = await db.execute({
			sql: `
        WITH query_embedding AS (
          SELECT json_extract(embedding, '$') AS vector
          FROM post_embeddings
          WHERE post_id = ?
        )
        SELECT p.post_id,
               json_extract(p.embedding, '$') AS embedding_vector,
               (SELECT vector FROM query_embedding) AS query_vector
        FROM post_embeddings p
        WHERE p.post_id != ?
        ORDER BY vector_cosine_similarity(
          json_extract(p.embedding, '$'),
          (SELECT vector FROM query_embedding)
        ) DESC
        LIMIT ?
      `,
			args: [post_id, post_id, limit],
		})

		return result.rows.map((row: any) => row.post_id)
	} catch (error) {
		console.error('Error getting related posts:', error)
		throw error
	}
}

export const get_post_embedding = async (
	post_id: string,
): Promise<number[] | null> => {
	try {
		const result = await db.execute({
			sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
			args: [post_id],
		})
		if (result.rows.length > 0) {
			return JSON.parse(result.rows[0].embedding as string)
		}
		return null
	} catch (error) {
		console.error('Error getting post embedding:', error)
		return null
	}
}
