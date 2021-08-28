export async function post(req) {
  const { email } = JSON.parse(req.body)
  await fetch('https://spences10.substack.com/api/v1/free?nojs=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  })
  return {
    status: 200,
    body: JSON.stringify({
      message: 'Email sent!',
    }),
  }
}
