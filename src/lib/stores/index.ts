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

export const popular_posts_store = writable<PopularPosts>({
  popular_posts_daily: [],
  popular_posts_monthly: [],
  popular_posts_yearly: [],
})

export const newsletter_subscriber_count_store = writable({
  newsletter_subscriber_count: 0,
})
