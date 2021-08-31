export async function post(req) {
  const { email } = JSON.parse(req.body)
  await fetch('https://www.getrevue.co/api/v2/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${import.meta.env.VITE_REVUE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: '',
      last_name: '',
      double_opt_in: false,
    }),
  })
  return {
    status: 200,
    body: JSON.stringify({
      message: 'Email sent!',
    }),
  }
}
