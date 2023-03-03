export const scale_and_fade = (
  node: HTMLDivElement,
  { delay, duration }: { delay: number; duration: number }
) => {
  return {
    delay,
    duration,
    css: (t: any) => {
      return `
          opacity: ${t};
          transform: scale(${t});
        `
    },
  }
}
