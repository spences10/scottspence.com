import { writable } from 'svelte/store'

export interface VisitorEntry {
	pathname: string
	title: string
	recent_visitors: number
}

export interface VisitorsData {
	visitor_data: VisitorEntry[]
}

export const visitors_store = writable<VisitorsData>({
	visitor_data: [],
})


export const newsletter_subscriber_count_store = writable({
	newsletter_subscriber_count: 0,
})
