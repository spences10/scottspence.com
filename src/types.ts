export interface Post {
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

export interface AnalyticsData {
  visits: string 
  uniques: string
  pageviews: string
  avg_duration: string | null
  bounce_rate: number
  date: string
  pathname: string
}
