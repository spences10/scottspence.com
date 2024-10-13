export const load = async ({ fetch }) => {
	// Fetch newsletter subscriber count
	const subscribers_promise = fetch(`api/subscribers`)

	const subscribers_response = await subscribers_promise
	const { newsletter_subscriber_count } =
		await subscribers_response.json()
	return {
		newsletter_subscriber_count,
	}
}
