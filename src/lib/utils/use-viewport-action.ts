// Thanks Lihau https://www.youtube.com/watch?v=1SKKzdHVvcI&t=182s

let intersectionObserver: IntersectionObserver

function ensure_intersection_observer() {
  if (intersectionObserver) return

  intersectionObserver = new IntersectionObserver(
    entries => {
      entries
        .filter(({ isIntersecting }) => isIntersecting)
        .forEach(entry => {
          entry.target.dispatchEvent(new CustomEvent('enter_viewport'))
        })
    },
    {
      rootMargin: '0px',
    }
  )
}

export default function viewport(element: Element) {
  ensure_intersection_observer()

  intersectionObserver.observe(element)

  return {
    destroy() {
      intersectionObserver.unobserve(element)
    },
  }
}
