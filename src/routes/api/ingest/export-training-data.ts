import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Extend the Post type for our needs
interface TrainingPost extends Post {
	content: string
}

export const export_training_data = async () => {
	try {
		const files = import.meta.glob('../../../../posts/**/*.md', {
			query: '?raw',
			import: 'default',
		})

		const processPosts = async (): Promise<TrainingPost[]> => {
			const processedPosts = await Promise.all(
				Object.entries(files).map(async ([path, importFn]) => {
					try {
						const content = (await importFn()) as string
						const parts = content.split('---')
						const frontmatter = parts[1]
						const markdown = parts.slice(2).join('---')

						// Type the frontmatter parsing
						const frontmatterEntries = frontmatter
							.trim()
							.split('\n')
							.map((line: string) => {
								// Handle empty values (like is_private with no value)
								if (!line.includes(':')) {
									return [line.trim(), true]
								}

								const [key, ...values] = line.split(':')
								let value: string | string[] | boolean = values
									.join(':')
									.trim()

								// Parse specific types
								if (value.startsWith('[') && value.endsWith(']')) {
									try {
										value = JSON.parse(value.replace(/'/g, '"')) // Array
									} catch {
										value = [] // Default to empty array if parsing fails
									}
								} else if (value === 'true') {
									value = true
								} else if (value === 'false' || value === '') {
									value = false
								}

								return [key.trim(), value]
							})

						const metadata = Object.fromEntries(
							frontmatterEntries,
						) as unknown as Post

						// Add required fields if they don't exist
						const post: TrainingPost = {
							...metadata,
							content: markdown.trim(),
							slug: path.split('/').pop()?.slice(0, -3) ?? '',
							tags: Array.isArray(metadata.tags) ? metadata.tags : [],
							is_private: Boolean(metadata.is_private),
							reading_time: metadata.reading_time || {
								text: '',
								minutes: 0,
								time: 0,
								words: 0,
							},
							reading_time_text: metadata.reading_time_text || '',
							preview_html: metadata.preview_html || '',
							preview: metadata.preview || '',
							previewHtml: metadata.previewHtml || '',
							path: metadata.path || path,
							date: metadata.date || new Date().toISOString(),
							title: metadata.title || '',
						}

						console.log('Processing:', path, {
							title: post.title,
							is_private: post.is_private,
							tags: post.tags,
						})

						return post
					} catch (error) {
						console.error('Error processing file:', path, error)
						return null
					}
				}),
			)

			return processedPosts.filter(
				(post): post is TrainingPost => post !== null,
			)
		}

		const validPosts = await processPosts()
		console.log('Valid posts:', validPosts.length)

		const publicPosts = validPosts
			.filter((post) => !post.is_private)
			.sort(
				(a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime(),
			)

		console.log('Public posts:', publicPosts.length)

		const trainingData = publicPosts.map((post) => ({
			messages: [
				{
					role: 'user',
					content: `Write a technical blog post titled "${post.title}"${
						post.tags.length > 0
							? ` about ${post.tags.join(', ')}`
							: ''
					}.`,
				},
				{
					role: 'assistant',
					content: post.content,
				},
			],
		}))

		const filename = 'training-data.jsonl'
		const outputPath = join(process.cwd(), filename)
		const jsonlContent = trainingData
			.map((item) => JSON.stringify(item))
			.join('\n')

		await writeFile(outputPath, jsonlContent, 'utf-8')

		const sizeInMb =
			Buffer.byteLength(jsonlContent, 'utf-8') / (1024 * 1024)

		return {
			message: 'Training data exported successfully',
			file_path: outputPath,
			total_posts: publicPosts.length,
			size_mb: sizeInMb.toFixed(2),
			debug: {
				found_files: Object.keys(files).length,
				valid_posts: validPosts.length,
				public_posts: publicPosts.length,
			},
		}
	} catch (error) {
		console.error('Error exporting training data:', error)
		throw new Error(
			`Failed to export training data: ${error instanceof Error ? error.message : 'Unknown error'}`,
		)
	}
}
