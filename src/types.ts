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
  total?: number
  content?: string
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

declare interface VisitorData {
  content: Array<{
    hostname: string
    pathname: string
    total: string
  }>
  referrers: Array<{
    referrer_hostname: string
    referrer_pathname: string
    total: string
  }>
  total: number
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



// https://stackoverflow.com/questions/73025100/svelte-svelte-kit-type-custom-action-event-with-typescript
// https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-getting-deprecation-warnings-for-sveltejsx--i-want-to-migrate-to-the-new-typings
declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:enter_viewport'?: (event: any) => any
    'on:exit_viewport'?: (event: any) => any
    'on:animation_end'?: (event: any) => any
  }
}
