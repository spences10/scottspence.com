import { FATHOM_API_KEY } from '$env/static/private'
import { turso_client } from '$lib/turso'

type FathomDataResponse =
	| AnalyticsData
	| Post
	| PopularPosts
	| null
	| []

/**
 * Fetches data from the Fathom Analytics API.
 *
 * @param fetch - The `fetch` function to use for making HTTP requests.
 * @param endpoint - The API endpoint to fetch data from `aggregations ` or `current_visitors`.
 * @param params - An object containing query parameters to include in the API request.
 * @param calling_function - Tracking where call are coming from.
 * @returns {Promise<FathomDataResponse>} The data returned by the API.
 */
export const fetch_fathom_data = async (
	fetch: Fetch,
	endpoint: string,
	params: Record<string, unknown>,
	calling_function: string,
): Promise<FathomDataResponse> => {
	const BYPASS_DB_LOGGING = true // Set to false to enable DB logging
	const client = turso_client()
	try {
		const url = new URL(`https://api.usefathom.com/v1/${endpoint}`)
		Object.entries(params)
			.sort(([key_a], [key_b]) => key_a.localeCompare(key_b))
			.forEach(([key, value]) => {
				const decoded_value = decodeURIComponent(value as string)
				url.searchParams.append(key, decoded_value)
			})

		const headers = new Headers()
		headers.append('Authorization', `Bearer ${FATHOM_API_KEY}`)
		const res = await fetch(url.toString(), { headers })

		if (!res.ok) {
			// Log the error for internal tracking
			console.error(`HTTP error ${res.status}: ${res.statusText}`)
			return null // Silently fail for the user
		}

		const content_type = res.headers.get('content-type')
		if (!content_type || !content_type.includes('application/json')) {
			// Log the error for internal tracking
			console.error('Invalid content type: Expected application/json')
			return null // Silently fail for the user
		}

		const data = await res.json()

		if (!BYPASS_DB_LOGGING) {
			await client.execute({
				sql: 'INSERT INTO fathom_api_calls (calling_function, endpoint, parameters) VALUES (?, ?, ?);',
				args: [calling_function, endpoint, JSON.stringify(params)],
			})
		}

		return data
	} catch (error) {
		// Log the error for internal tracking
		console.error(`Error fetching Fathom data: ${error}`)
		return null
	}
}
