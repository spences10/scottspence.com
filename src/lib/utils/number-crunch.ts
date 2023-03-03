export const number_crunch = (num: number | string): string => {
  if (!num) return '0'

  const suffixes = ['', 'k', 'm', 'b', 't']
  const num_absolute = Math.abs(Number(num))
  const sign = Math.sign(Number(num))

  if (isNaN(num_absolute)) return '0'

  const magnitude = Math.min(
    Math.floor(Math.log10(num_absolute) / 3),
    suffixes.length - 1
  )

  if (magnitude === 0 && num_absolute < 1) return '0'

  const abbreviation = (
    num_absolute / Math.pow(10, magnitude * 3)
  ).toFixed(magnitude === 0 ? 0 : 1)
  const abbreviation_without_trailing_zero = abbreviation.endsWith(
    '.0'
  )
    ? abbreviation.substring(0, abbreviation.length - 2)
    : abbreviation
  return `${
    sign < 0 ? '-' : ''
  }${abbreviation_without_trailing_zero}${suffixes[magnitude]}`
}
