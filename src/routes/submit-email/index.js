export async function post(req) {
  const { email } = JSON.parse(req.body)
  await fetch('https://spences10.substack.com/api/v1/free', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers':
        'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
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
