/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const fetchAnalytics = async () => {
    const res = await fetch(
      `analytics.json?pathname=/posts/use-chrome-in-ubuntu-wsl&date_from=2023-01-30T00:00:00.000Z&date_to=2023-01-30T23:59:59.999Z&date_grouping=hour&sort_by=timestamp:asc`
    )
    const { analytics } = await res.json()
    return analytics
  }

  return {
    analytics: fetchAnalytics(),
  }
}
