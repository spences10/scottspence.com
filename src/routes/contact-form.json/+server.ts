import { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } from '$env/static/private'
import { json as json$1 } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const fd = await request.formData()

  const name = fd.get('name')
  const email = fd.get('email')
  const reason = fd.get('reason')
  const message = fd.get('message')

  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contact%20Requests`

  let data = {
    records: [
      {
        fields: {
          name,
          email,
          reason,
          message,
        },
      },
    ],
  }
  const res = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (res.ok) {
    return json$1({
      message: 'success',
    })
  } else {
    return json$1(
      {
        message: 'failed',
      },
      {
        status: 404,
      }
    )
  }
}
