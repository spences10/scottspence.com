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
  slug: string
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
