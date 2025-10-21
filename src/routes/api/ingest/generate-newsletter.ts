import { generate_newsletter as generate } from '$lib/newsletter/generator'

/**
 * Generate newsletter from GitHub activity
 * Returns the generated newsletter content along with metadata
 */
export const generate_newsletter = async () => {
	try {
		console.log('Starting newsletter generation task...')
		const result = await generate()

		return {
			success: true,
			message: 'Newsletter generated successfully',
			data: {
				filepath: result.filepath,
				filename: result.filename,
				content: result.content,
			},
		}
	} catch (error) {
		console.error('Error in generate_newsletter task:', error)
		throw error
	}
}
