import { VOYAGE_AI_API_KEY } from '$env/static/private'
import { turso_client } from '$lib/turso'

const create_embedding = async (text: string): Promise<number[]> => {
	try {
		const response = await fetch(
			'https://api.voyageai.com/v1/embeddings',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${VOYAGE_AI_API_KEY}`,
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
	const client = turso_client()
	try {
		const embedding = await create_embedding(content)
		if (embedding.length !== 1024) {
			throw new Error(
				`Expected 1024 dimensions, but got ${embedding.length}`,
			)
		}
		const embedding_buffer = new Float32Array(embedding).buffer

		await client.execute({
			sql: 'INSERT OR REPLACE INTO post_embeddings (post_id, embedding) VALUES (?, ?)',
			args: [post_id, embedding_buffer],
		})
	} catch (error) {
		console.error(
			`Error storing embedding for post ${post_id}:`,
			error,
		)
		throw error
	}
}

function cosine_similarity(a: Float32Array, b: Float32Array): number {
	let dot_product = 0
	let norm_a = 0
	let norm_b = 0
	for (let i = 0; i < a.length; i++) {
		dot_product += a[i] * b[i]
		norm_a += a[i] * a[i]
		norm_b += b[i] * b[i]
	}
	return dot_product / (Math.sqrt(norm_a) * Math.sqrt(norm_b))
}

export const get_related_posts = async (
	post_id: string,
	limit: number = 4,
) => {
	const client = turso_client()
	try {
		// First get the target post's embedding
		const target_post_result = await client.execute({
			sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
			args: [post_id],
		})

		if (target_post_result.rows.length === 0) {
			throw new Error(`No embedding found for post_id: ${post_id}`)
		}

		const target_embedding = target_post_result.rows[0].embedding

		// Now get related posts using the embedding as a parameter
		const result = await client.execute({
			sql: `SELECT post_id, 
				vector_distance_cos(embedding, ?) as distance 
			FROM post_embeddings 
			WHERE post_id != ? 
			ORDER BY distance ASC 
			LIMIT ?`,
			args: [target_embedding, post_id, limit],
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
	const client = turso_client()
	try {
		const result = await client.execute({
			sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
			args: [post_id],
		})
		if (result.rows.length > 0) {
			const embedding = result.rows[0].embedding
			if (embedding instanceof ArrayBuffer) {
				return Array.from(new Float32Array(embedding))
			}
		}
		return null
	} catch (error) {
		console.error('Error getting post embedding:', error)
		return null
	}
}

