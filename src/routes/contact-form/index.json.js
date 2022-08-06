import { env } from '$env/dynamic/private'

export const POST = async ({ request }) => {
  const fd = await request.formData()

  const name = fd.get('name')
  const email = fd.get('email')
  const reason = fd.get('reason')
  const message = fd.get('message')

  const AIRTABLE_URL = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Contact%20Requests`

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
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (res.ok) {
    return {
      status: 200,
      body: {
        message: 'success',
      },
    }
  } else {
    return {
      status: 404,
      body: {
        message: 'failed',
      },
    }
  }
}
