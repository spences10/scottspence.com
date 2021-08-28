export async function post(req) {
  const { email } = JSON.parse(req.body)
  await fetch('https://spences10.substack.com/api/v1/free', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  })
  return {
    body: {
      email,
    },
  }
}
