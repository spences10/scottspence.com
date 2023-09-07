declare interface Post {
  date: string
  title: string
  tags: string[]
  isPrivate: boolean
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
  preview: string
  previewHtml: string
  slug: string | null
  path: string
}

declare interface AnalyticsData {
  visits: string
  uniques: string
  pageviews: string
  avg_duration: string | null
  bounce_rate: number
  date: string
  pathname: string
}

declare interface Fetch {
  (input: RequestInfo, init?: RequestInit): Promise<Response>
}

declare interface ReactionCount {
  [key: string]: number
}

declare interface ReactionsData {
  path?: string
  count: ReactionCount
}

declare interface ReactionEntry {
  path: string
  [key: string]: number | string
}

declare interface ReactionPage {
  rank?: number
  path: string
  count: number
}

declare interface PopularPost {
  visits: string
  pageviews: string
  pathname: string
  title: string
}

declare interface PopularPosts {
  popular_posts_daily: PopularPost[]
  popular_posts_monthly: PopularPost[]
  popular_posts_yearly: PopularPost[]
}
