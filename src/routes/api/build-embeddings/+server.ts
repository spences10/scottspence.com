import { json } from '@sveltejs/kit'
import { build_embeddings } from '$lib/server/build-embeddings'
import { INGEST_TOKEN } from '$env/static/private'

export const POST = async ({ request }) => {
	const { secret } = await request.json()

	if (secret !== INGEST_TOKEN) {
		return json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		await build_embeddings()
		return json({ message: 'Embeddings built successfully' })
	} catch (error) {
		console.error('Error building embeddings:', error)
		return json(
			{ error: 'Failed to build embeddings', details: error.message },
			{ status: 500 }
		)
	}
}
