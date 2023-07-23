import { writable } from 'svelte/store'

export interface VisitorsData {
  visitors: {
    total: number
    content: {
      hostname: string
      pathname: string
      total: number
    }[]
    referrers: {
      referrer_hostname: string
      referrer_pathname: string
      total: number
    }[]
  }
}

export const popular_posts_store = writable<PopularPosts>({
  popular_posts_daily: [],
  popular_posts_monthly: [],
  popular_posts_yearly: [],
})

export const visitors_store = writable<VisitorsData>({
  visitors: {
    total: 0,
    content: [],
    referrers: [],
  },
})
