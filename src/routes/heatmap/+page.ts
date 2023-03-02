import type { PageLoad } from './$types'

// export const prerender = true
export const load: PageLoad = async ({ fetch }) => {
  const year = 2019
  const res = await fetch(`/github-contributions.json?year=${year}`)
  if (res.ok) {
    const data = await res.json()
    return { data }
  }
}
