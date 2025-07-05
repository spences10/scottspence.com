import { object_to_query_params } from './object-to-query-params'

export const og_image_url = (
	author: string,
	website: string,
	title: string,
) => {
	const params = {
		title,
		author,
		website: website || `scottspence.com`,
	}
	return `https://og.scott.garden/og${object_to_query_params(params)}`
}
