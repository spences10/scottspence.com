import { redirect } from '@sveltejs/kit'

export const GET = async () => {
  redirect(301, `/posts`);
}
