import { generate_newsletter } from '../src/lib/newsletter/generator'

try {
	await generate_newsletter()
} catch (error) {
	console.error('Failed to generate newsletter:', error)
	process.exit(1)
}
