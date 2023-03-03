import { getPosts } from '$lib/utils'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, parent, data }) => {
  await parent()
  const { slug } = params
  const post = getPosts().find(post => slug === post.metadata.slug)
  if (!post) {
    throw error(404, 'Post not found')
  }

  return {
    hourly_visits: data?.hourly_visits,
    daily_visits: data?.daily_visits,
    monthly_visits: data?.monthly_visits,
    yearly_visits: data?.yearly_visits,
    ...post.metadata,
    component: post.component,
  }
}
