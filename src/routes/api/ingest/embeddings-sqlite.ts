import { VOYAGE_AI_API_KEY } from '$env/static/private'
import { sqlite_client } from '$lib/sqlite/client'

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
	const client = sqlite_client()
	try {
		const embedding = await create_embedding(content)
		if (embedding.length !== 1024) {
			throw new Error(
				`Expected 1024 dimensions, but got ${embedding.length}`,
			)
		}

		// For sqlite-vec, we can either:
		// 1. Use JSON string format (simpler)
		// 2. Use Float32Array buffer with vec_f32() function

		// Option 1: JSON format (recommended for new embeddings)
		const embedding_json = JSON.stringify(embedding)
		
		const stmt = client.prepare(`
			INSERT OR REPLACE INTO post_embeddings (post_id, embedding) 
			VALUES (?, ?)
		`)
		stmt.run(post_id, embedding_json)
		
		client.close()
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
	limit: number = 4,
) => {
	const client = sqlite_client()
	try {
		// Option 1: Use KNN syntax (most efficient)
		const stmt = client.prepare(`
			SELECT post_id, distance 
			FROM post_embeddings
			WHERE embedding MATCH (
				SELECT embedding FROM post_embeddings WHERE post_id = ?
			)
			AND k = ?
			AND post_id != ?
		`)
		
		const results = stmt.all(post_id, limit + 1, post_id)
		client.close()
		
		// Filter out the original post if it appears and limit results
		return results
			.filter((row: any) => row.post_id !== post_id)
			.slice(0, limit)
			.map((row: any) => row.post_id)
			
	} catch (error) {
		console.error('Error getting related posts:', error)
		client.close()
		
		// Fallback to traditional distance calculation
		try {
			const fallback_client = sqlite_client()
			
			const stmt = fallback_client.prepare(`
				SELECT post_id, 
					vec_distance_cosine(
						embedding, 
						(SELECT embedding FROM post_embeddings WHERE post_id = ?)
					) as distance 
				FROM post_embeddings 
				WHERE post_id != ? 
				ORDER BY distance ASC 
				LIMIT ?
			`)
			
			const results = stmt.all(post_id, post_id, limit)
			fallback_client.close()
			
			return results.map((row: any) => row.post_id)
		} catch (fallback_error) {
			console.error('Fallback query also failed:', fallback_error)
			throw error
		}
	}
}

export const get_post_embedding = async (
	post_id: string,
): Promise<number[] | null> => {
	const client = sqlite_client()
	try {
		const stmt = client.prepare(`
			SELECT embedding FROM post_embeddings WHERE post_id = ?
		`)
		const result = stmt.get(post_id)
		client.close()
		
		if (result) {
			const embedding = result.embedding
			
			// Handle different embedding formats
			if (typeof embedding === 'string') {
				// JSON format
				try {
					return JSON.parse(embedding)
				} catch {
					// If not JSON, might be from migration - use vec_to_json
					const json_client = sqlite_client()
					const json_stmt = json_client.prepare(`
						SELECT vec_to_json(embedding) as embedding_json 
						FROM post_embeddings WHERE post_id = ?
					`)
					const json_result = json_stmt.get(post_id)
					json_client.close()
					
					if (json_result) {
						return JSON.parse(json_result.embedding_json)
					}
				}
			} else if (embedding instanceof Buffer) {
				// Binary format from migration
				return Array.from(new Float32Array(embedding))
			}
		}
		
		return null
	} catch (error) {
		console.error('Error getting post embedding:', error)
		client.close()
		return null
	}
}