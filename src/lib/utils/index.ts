interface Config {
  [key: string]: string
}

export const getPadding = (aspectRatio: string | number) => {
  const config: Config = {
    '1:1': `padding-top: 100%;`,
    '16:9': `padding-top: 56.25%;`,
    '4:3': `padding-top: 75%;`,
    '3:2': `padding-top: 66.66%;`,
    '8.5': `padding-top: 62.5%;`,
  }

  return config[String(aspectRatio)]
}

export const object_to_query_params = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return '?' + params.join('&')
}

// https://stackoverflow.com/a/50836512
export const number_crunch = (value: string | number) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      value = (value / 1000000).toFixed(2) + 'm'
    } else if (value >= 1000) {
      value = (value / 1000).toFixed(2) + 'k'
    }
  }
  return value
}

// https://stackoverflow.com/a/46545530
export const shuffle_array = (array: any[]) => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

export const get_current_page_visitors = (
  path: string,
  content: any[]
) => {
  let current_visitors = content.find(
    visitor => visitor.pathname === path
  )
  if (!current_visitors)
    return (current_visitors = {
      total: 0,
      content: [],
      referrers: [],
    })
  return current_visitors
}
