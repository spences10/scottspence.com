import { env } from '$env/dynamic/private'

export const POST = async ({ request }) => {
  const { email } = await request.json()

  try {
    const res = await fetch(
      'https://api.sendinblue.com/v3/contacts/doubleOptinConfirmation',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': env.EMAIL_SIGNUP_API_KEY,
        },
        body: JSON.stringify({
          email,
          attributes: {
            FNAME: '',
            LNAME: '',
          },
          includeListIds: [4],
          redirectionUrl: 'https://scottspence.com',
          templateId: 6,
        }),
      }
    )

    if (res.ok) {
      return new Response(
        JSON.stringify({
          message: 'email sent!',
        })
      )
    }
    if (res.status !== 200) {
      return new Response(
        JSON.stringify({
          message: 'bad request',
        }),
        { status: 400 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'something went wrong with the email submit!',
      }),
      { status: 500 }
    )
  }
}
