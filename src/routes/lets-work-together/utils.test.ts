import { describe, expect, it } from 'vitest'
import { billable_days, country_to_currency } from './utils'

describe('country_to_currency', () => {
	it('returns GBP for GB', () => {
		expect(country_to_currency('GB')).toBe('GBP')
	})

	it('returns EUR for eurozone countries', () => {
		expect(country_to_currency('DE')).toBe('EUR')
		expect(country_to_currency('FR')).toBe('EUR')
		expect(country_to_currency('NL')).toBe('EUR')
		expect(country_to_currency('IE')).toBe('EUR')
	})

	it('returns USD for US', () => {
		expect(country_to_currency('US')).toBe('USD')
	})

	it('returns USD for unknown countries', () => {
		expect(country_to_currency('JP')).toBe('USD')
		expect(country_to_currency('AU')).toBe('USD')
	})

	it('returns USD for null', () => {
		expect(country_to_currency(null)).toBe('USD')
	})
})

describe('billable_days', () => {
	it('subtracts PTO and public holidays', () => {
		expect(billable_days(252, 30, 8)).toBe(214)
	})

	it('defaults to zero PTO and holidays', () => {
		expect(billable_days(252)).toBe(252)
	})
})
