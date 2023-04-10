import { tick } from 'svelte'

export const get_headings = async (headings: string = 'h2') => {
  await tick()
  const headingElements = document.querySelectorAll(headings)
  return Array.from(headingElements).map((element, index) => {
    const href = element.id || `heading-${index}`
    element.id = href
    return { label: element.textContent || '', href: `#${href}` }
  })
}
