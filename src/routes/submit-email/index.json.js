import { env } from '$env/dynamic/private'

export const POST = async ({ request }) => {
  const { email } = await request.json()

  try {
    const res = await fetch(
      'https://www.getrevue.co/api/v2/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${env.REVUE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: '',
          last_name: '',
          double_opt_in: false,
        }),
      }
    )

    if (res.ok) {
      return {
        status: 200,
        body: JSON.stringify({
          message: 'email sent!',
        }),
      }
    }
    if (res.status !== 200) {
      return {
        status: 400,
        body: JSON.stringify({
          message: 'bad request',
        }),
      }
    }
  } catch (error) {
    return {
      status: 500,
      body: JSON.stringify({
        message: 'something went wrong with the email submit!',
      }),
    }
  }
}
