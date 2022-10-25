const objectToQueryParams = obj => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return '?' + params.join('&')
}

export const ogImageUrl = (author, website, title) => {
  const params = {
    title,
    author,
    website: website || `scottspence.com`,
  }
  return `https://ogimggen.vercel.app/og${objectToQueryParams(
    params
  )}`
}
