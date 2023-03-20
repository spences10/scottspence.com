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

export interface PopularPost {
  visits: number
  uniques: number
  pageviews: number
  title: string
  pathname: string
}

export const popular_posts_store = writable<PopularPost[]>([])

export const visitors_store = writable<VisitorsData>({
  visitors: {
    total: 0,
    content: [],
    referrers: [],
  },
})
