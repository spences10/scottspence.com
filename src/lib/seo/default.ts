import { description, language, name, website } from '$lib/info'
import { og_image_url } from '$lib/utils'

import type { SeoConfig } from 'svead'

export const same_as = [
	'https://www.twitter.com/spences10',
	'https://www.github.com/spences10',
	'https://www.linkedin.com/in/spences10',
]

export const default_seo_config: SeoConfig = {
	title: 'Default Page Title',
	description,
	url: website,
	website,
	open_graph_image: og_image_url(name, 'scottspence.com', name),
	language,
	author_name: name,
	twitter_handle: '@spences10',
	site_name: name,
}

const person = {
	'@type': 'Person',
	name: name,
	url: website,
	sameAs: same_as,
} as const

export const default_schema_org_config = {
	'@type': 'WebSite' as const,
	'@id': website,
	url: website,
	name: name,
	description: description,
	publisher: person,
	author: person,
}

export const create_seo_config = (
	options: Partial<SeoConfig> & { slug?: string },
): SeoConfig => ({
	...default_seo_config,
	...options,
	title: options.title
		? `${options.title} - ${name}`
		: default_seo_config.title,
	url: options.slug ? `${website}/${options.slug}` : website,
	open_graph_image:
		options.open_graph_image ||
		og_image_url(name, 'scottspence.com', options.title || ''),
})

export const create_schema_org_config = <
	T extends Record<string, unknown>,
>(
	options: T,
) => ({
	...default_schema_org_config,
	...options,
})
