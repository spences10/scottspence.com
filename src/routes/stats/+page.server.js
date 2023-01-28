/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const fetchAnalytics = async () => {
    const res = await fetch(
      `analytics.json?pathname=/posts/use-chrome-in-ubuntu-wsl`
    )
    const { analytics } = await res.json()
    return analytics
  }

  return {
    analytics: fetchAnalytics(),
  }
}
