import { get_subscriber_count } from '$lib/state/subscribers.svelte'

export const load = async () => {
	const { newsletter_subscriber_count } = await get_subscriber_count()
	return {
		newsletter_subscriber_count,
	}
}
