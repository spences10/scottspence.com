type BlockFathomResponse = {
  body: {
    [key: string]: any
    message?: string
  }
  headers: {
    'X-Robots-Tag': string
  }
} | null

/**
 * Handles the block fathom scenario.
 *
 * @param data - The cached data.
 * @param data_key - The key for the response body.
 * @returns {BlockFathomResponse} - Returns an object of type BlockFathomResponse containing the response
 * body and headers if the Fathom script is blocked, or null.
 */
export const handle_block_fathom = (
  data: any,
  data_key: string,
): BlockFathomResponse => {
  console.log('=====================')
  console.log(
    `Handle Block Fathom: ${
      data_key.charAt(0).toUpperCase() + data_key.slice(1)
    }`,
  )
  console.log('=====================')

  if (
    (Array.isArray(data) && data.length > 0) ||
    (data && data.total != null && data.content)
  ) {
    // Cached data is available, return it
    console.log('=====================')
    console.log(
      `Handle Block Fathom Cache Hit: ${
        data_key.charAt(0).toUpperCase() + data_key.slice(1)
      }`,
    )
    console.log('=====================')
    return {
      body: {
        [data_key]: data,
      },
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  } else {
    // No cached data available, return empty array
    console.log('=====================')
    console.log(
      `Handle Block Fathom Cache Miss: ${
        data_key.charAt(0).toUpperCase() + data_key.slice(1)
      }`,
    )
    console.log('=====================')
    return {
      body: {
        [data_key]: Array.isArray(data) ? [] : {},
        message: 'Fathom script is blocked on the client-side.',
      },
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  }
}
