import { tick } from 'svelte'

export const get_headings = async (headings: string = 'h2') => {
  await tick()

  // Clear previous headings
  const previousHeadings = document.querySelectorAll('.toc-heading')
  previousHeadings.forEach(heading => heading.remove())

  const headingElements = document.querySelectorAll(headings)
  return Array.from(headingElements).map((element, index) => {
    const href = element.id || `heading-${index}`
    element.id = href
    element.classList.add('toc-heading')
    return { label: element.textContent || '', href: `#${href}` }
  })
}
