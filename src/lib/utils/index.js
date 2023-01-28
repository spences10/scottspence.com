export const getPadding = aspectRatio => {
  const config = {
    '1:1': `padding-top: 100%;`,
    '16:9': `padding-top: 56.25%;`,
    '4:3': `padding-top: 75%;`,
    '3:2': `padding-top: 66.66%;`,
    8.5: `padding-top: 62.5%;`,
  }

  return config[aspectRatio]
}

export const object_to_query_params = obj => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return '?' + params.join('&')
}

// https://stackoverflow.com/a/50836512
export const number_crunch = value => {
  if (value >= 1000000) {
    value = (value / 1000000).toFixed + 'm'
  } else if (value >= 1000) {
    value = (value / 1000).toFixed(2) + 'k'
  }
  return value
}

// https://stackoverflow.com/a/46545530
export const shuffle_array = array => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
