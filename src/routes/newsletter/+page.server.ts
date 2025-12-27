import { get_subscriber_count } from '$lib/data/subscribers.remote'

export const load = async () => {
	const { newsletter_subscriber_count } = await get_subscriber_count()
	return {
		newsletter_subscriber_count,
	}
}
