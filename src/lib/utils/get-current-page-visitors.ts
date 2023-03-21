export const get_current_page_visitors = (
  path: string,
  content: any[]
) => {
  const current_visitors = Array.isArray(content)
    ? content.find(visitor => visitor.pathname === path)
    : null

  return (
    current_visitors || {
      total: 0,
      content: [],
      referrers: [],
    }
  )
}
