import { description, name, website } from '$lib/info'
import { og_image_url } from '$lib/utils'

import type { SeoConfig } from 'svead'

export const language = 'en-GB'

export const same_as = [
  'https://www.twitter.com/spences10',
  'https://www.github.com/spences10',
  'https://www.linkedin.com/in/spences10',
]

export const default_seo_config: SeoConfig = {
  title: 'Default Page Title',
  description,
  url: website,
  website,
  open_graph_image: og_image_url(name, 'scottspence.com', name),
  language,
  author_name: name,
  author_url: website,
  publisher_name: name,
  publisher_url: website,
  same_as,
}
