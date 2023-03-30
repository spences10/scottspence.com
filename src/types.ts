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
