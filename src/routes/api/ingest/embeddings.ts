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
	limit: number = 5,
) => {
	const client = turso_client()
	try {
		// First, get the embedding for the current post
		const current_post_result = await client.execute({
			sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
			args: [post_id],
		})

		if (current_post_result.rows.length === 0) {
			throw new Error(`No embedding found for post_id: ${post_id}`)
		}

		const current_embedding = new Float32Array(
			current_post_result.rows[0].embedding as ArrayBuffer,
		)

		// Get all other posts' embeddings
		const all_posts_result = await client.execute({
			sql: 'SELECT post_id, embedding FROM post_embeddings WHERE post_id != ?',
			args: [post_id],
		})

		// Calculate similarities
		const similarities = all_posts_result.rows.map((row: any) => ({
			post_id: row.post_id,
			similarity: cosine_similarity(
				current_embedding,
				new Float32Array(row.embedding as ArrayBuffer),
			),
		}))

		// Sort by similarity and take top 'limit' results
		const related_posts = similarities
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit)

		return related_posts.map(post => post.post_id)
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

export const search_similar_posts = async (
	query_embedding: number[],
	limit: number = 5,
) => {
	const client = turso_client()
	const query_embedding_array = new Float32Array(query_embedding)

	const all_posts_result = await client.execute(
		'SELECT post_id, embedding FROM post_embeddings',
	)

	const similarities = all_posts_result.rows.map((row: any) => ({
		post_id: row.post_id,
		similarity: cosine_similarity(
			query_embedding_array,
			new Float32Array(row.embedding as ArrayBuffer),
		),
	}))

	return similarities
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, limit)
}
