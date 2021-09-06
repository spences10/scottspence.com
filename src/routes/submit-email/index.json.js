export async function post(req) {
  const { email } = JSON.parse(req.body)
  const REVUE_API_KEY = process.env['REVUE_API_KEY']

  try {
    const res = await fetch(
      'https://www.getrevue.co/api/v2/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${REVUE_API_KEY}`,
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
    if (res.status === 400) {
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
