import { redirect } from '@sveltejs/kit'

export const GET = async () => {
  throw redirect(301, `/posts`)
}
