// Utility functions for loading newsletter markdown files

export interface Newsletter {
	title: string
	date: string
	published: boolean
	slug: string
}

export const get_newsletters = async (): Promise<Newsletter[]> => {
	const newsletter_files = import.meta.glob('/newsletter/*.md')

	const newsletters: Newsletter[] = []

	for (const [path, loader] of Object.entries(newsletter_files)) {
		// Skip README.md
		if (path.includes('README')) continue

		const slug = path.split('/').pop()?.replace('.md', '') || ''

		// Load the module
		const module = (await loader()) as {
			metadata: { title: string; date: string; published: boolean }
		}

		newsletters.push({
			title: module.metadata.title,
			date: module.metadata.date,
			published: module.metadata.published,
			slug,
		})
	}

	// Sort by date, newest first
	return newsletters.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
}
