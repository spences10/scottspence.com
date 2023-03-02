// https://stackoverflow.com/a/50836512
export const number_crunch = (value: string | number) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      value = (value / 1000000).toFixed(2) + 'm'
    } else if (value >= 1000) {
      value = (value / 1000).toFixed(2) + 'k'
    }
  }
  return value
}
