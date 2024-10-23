import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
	get_post_embedding,
	store_post_embedding,
} from './embeddings'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const POSTS_DIRECTORY = path.join(__dirname, '../../../posts')

async function get_posts(): Promise<Post[]> {
	const files = await fs.readdir(POSTS_DIRECTORY)
	const posts = await Promise.all(
		files
			.filter(file => file.endsWith('.md'))
			.map(async file => {
				const slug = file.replace('.md', '')
				const filePath = path.join(POSTS_DIRECTORY, file)
				const content = await fs.readFile(filePath, 'utf-8')
				const { attributes, body } = parseFrontmatter(content)
				return {
					title: attributes.title || '',
					slug,
					path: `/posts/${slug}`,
					content: body,
					description: attributes.description || '',
				} as Post
			}),
	)
	return posts
}

function parseFrontmatter(content: string): {
	attributes: Record<string, string>
	body: string
} {
	const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
	const match = frontmatterRegex.exec(content)
	if (!match) return { attributes: {}, body: content }

	const frontmatter = match[1]
	const body = content.replace(frontmatterRegex, '').trim()
	const attributes: Record<string, string> = {}
	frontmatter.split('\n').forEach(line => {
		const [key, ...rest] = line.split(':')
		if (key && rest.length) {
			attributes[key.trim()] = rest.join(':').trim()
		}
	})
	return { attributes, body }
}

export const build_embeddings = async () => {
	try {
		const posts = await get_posts()
		const total_posts = posts.length
		console.log(
			`Starting to build embeddings for ${total_posts} posts`,
		)

		let new_embeddings = 0
		let existing_embeddings = 0

		for (const post of posts) {
			if (post.slug) {
				try {
					const existing_embedding = await get_post_embedding(
						post.slug,
					)

					if (!existing_embedding) {
						const content = `${post.title}\n${post.content}`
						await store_post_embedding(post.slug, content)
						new_embeddings++
					} else {
						existing_embeddings++
					}
				} catch (error) {
					console.error(
						`Error processing embedding for post ${post.slug}:`,
						error,
					)
				}
			}
		}
		console.log(
			`Finished building embeddings. New: ${new_embeddings}, Existing: ${existing_embeddings}`,
		)
	} catch (error) {
		console.error('Error in build_embeddings:', error)
	}
}
