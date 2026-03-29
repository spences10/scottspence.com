import { describe, expect, it } from 'vitest'
import {
	calculate_contractor_take_home,
	calculate_contractor_vs_permanent,
	calculate_gross_from_take_home,
	calculate_permanent_take_home,
	DEFAULT_TAX_CONFIG,
} from './uk-tax-calculator'

const config = DEFAULT_TAX_CONFIG

describe('calculate_permanent_take_home', () => {
	it('returns full salary when below personal allowance', () => {
		const result = calculate_permanent_take_home(10000, config)
		expect(result.income_tax).toBe(0)
		expect(result.employee_ni).toBe(0)
		expect(result.take_home).toBe(10000)
	})

	it('calculates basic rate correctly', () => {
		const result = calculate_permanent_take_home(30000, config)
		// Taxable: 30000 - 12570 = 17430
		// Tax: 17430 * 0.2 = 3486
		expect(result.income_tax).toBe(3486)
		expect(result.personal_allowance).toBe(12570)
	})

	it('calculates higher rate correctly', () => {
		const result = calculate_permanent_take_home(80000, config)
		// Basic: (50270 - 12570) * 0.2 = 7540
		// Higher: (80000 - 50270) * 0.4 = 11892
		expect(result.income_tax).toBe(7540 + 11892)
	})

	it('tapers personal allowance above 100k', () => {
		const result = calculate_permanent_take_home(110000, config)
		// Excess: 110000 - 100000 = 10000, lose 5000 PA
		expect(result.personal_allowance).toBe(12570 - 5000)
	})

	it('removes personal allowance entirely above 125140', () => {
		const result = calculate_permanent_take_home(130000, config)
		expect(result.personal_allowance).toBe(0)
	})

	it('calculates additional rate above 125140', () => {
		const result = calculate_permanent_take_home(150000, config)
		expect(result.personal_allowance).toBe(0)
		// Has basic + higher + additional components
		expect(result.income_tax).toBeGreaterThan(40000)
	})

	it('calculates employee NI correctly', () => {
		const result = calculate_permanent_take_home(60000, config)
		// Main: (50270 - 12570) * 0.08 = 3016
		// Upper: (60000 - 50270) * 0.02 = 194.60
		expect(result.employee_ni).toBeCloseTo(3016 + 194.6, 0)
	})
})

describe('calculate_contractor_take_home', () => {
	it('uses personal allowance as salary', () => {
		const result = calculate_contractor_take_home(100000, config)
		expect(result.salary).toBe(12570)
	})

	it('applies corporation tax at 25%', () => {
		const result = calculate_contractor_take_home(100000, config)
		const profit = 100000 - 12570
		expect(result.corporation_tax).toBe(
			Math.round(profit * 0.25 * 100) / 100,
		)
	})

	it('calculates realistic take-home for 575/day', () => {
		const result = calculate_contractor_take_home(575 * 252, config)
		// Should be roughly 87-90k
		expect(result.take_home).toBeGreaterThan(85000)
		expect(result.take_home).toBeLessThan(92000)
	})
})

describe('calculate_gross_from_take_home', () => {
	it('finds gross that produces target take-home', () => {
		const target = 70000
		const result = calculate_gross_from_take_home(target, config)
		expect(result.take_home).toBeCloseTo(target, 0)
	})

	it('handles the 60% trap zone correctly', () => {
		// Someone wanting 80k take-home needs to earn in the trap zone
		const result = calculate_gross_from_take_home(80000, config)
		expect(result.gross).toBeGreaterThan(120000)
		expect(result.take_home).toBeCloseTo(80000, 0)
	})
})

describe('calculate_contractor_vs_permanent', () => {
	it('produces matching take-home for both routes', () => {
		const result = calculate_contractor_vs_permanent(575, 252, config)
		// Binary search gets within £1 precision
		expect(
			Math.abs(
				result.contractor.take_home -
					result.equivalent_permanent.take_home,
			),
		).toBeLessThan(2)
	})

	it('equivalent salary is less than contractor gross', () => {
		const result = calculate_contractor_vs_permanent(575, 252, config)
		// Contractor gross: 144900
		// Equivalent salary should be less (tax efficiency of Ltd route)
		expect(result.equivalent_permanent.gross).toBeLessThan(
			result.contractor.gross_annual,
		)
	})

	it('uses correct gross annual', () => {
		const result = calculate_contractor_vs_permanent(575, 252, config)
		expect(result.contractor.gross_annual).toBe(575 * 252)
	})
})
