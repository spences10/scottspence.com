import {
	endOfDay,
	endOfMonth,
	endOfYear,
	formatISO,
	startOfDay,
	startOfMonth,
	startOfYear,
} from 'date-fns'

type PeriodType = 'day' | 'month' | 'year'

const date_range_functions: Record<
	PeriodType,
	(now: Date) => string[]
> = {
	day: (now: Date) => [
		formatISO(startOfDay(now)),
		formatISO(endOfDay(now)),
	],
	month: (now: Date) => [
		formatISO(startOfMonth(now)),
		formatISO(endOfMonth(now)),
	],
	year: (now: Date) => [
		formatISO(startOfYear(now)),
		formatISO(endOfYear(now)),
	],
}

export const get_date_range = (period: string) => {
	const now = new Date()
	const range_function = date_range_functions[period as PeriodType]
	if (!range_function) {
		throw new Error(`Unknown period: ${period}`)
	}
	return range_function(now)
}
