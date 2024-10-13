import { describe, expect, it } from 'vitest'
import { number_crunch } from './number-crunch'

describe('number_crunch', () => {
	it('should return "0" when given an empty string', () => {
		expect(number_crunch('')).toEqual('0')
	})

	it('should return "0" when given 0', () => {
		expect(number_crunch(0)).toEqual('0')
	})

	it('should return "0" when given NaN', () => {
		expect(number_crunch(NaN)).toEqual('0')
	})

	it('should return "0" when given a non-numeric string', () => {
		expect(number_crunch('hello')).toEqual('0')
	})

	it('should return the correct string for numbers between 1 and 999', () => {
		expect(number_crunch(1)).toEqual('1')
		expect(number_crunch(15)).toEqual('15')
		expect(number_crunch(999)).toEqual('999')
	})

	it('should return the correct abbreviation for a given number', () => {
		expect(number_crunch(1234)).toEqual('1.2k')
		expect(number_crunch(12345)).toEqual('12.3k')
		expect(number_crunch(123456)).toEqual('123.5k')
		expect(number_crunch(1234567)).toEqual('1.2m')
		expect(number_crunch(12345678)).toEqual('12.3m')
		expect(number_crunch(123456789)).toEqual('123.5m')
		expect(number_crunch(1234567890)).toEqual('1.2b')
		expect(number_crunch(12345678901)).toEqual('12.3b')
		expect(number_crunch(123456789012)).toEqual('123.5b')
		expect(number_crunch(1234567890123)).toEqual('1.2t')
		expect(number_crunch(12345678901234)).toEqual('12.3t')
		expect(number_crunch(123456789012345)).toEqual('123.5t')
	})

	it('should return the correct abbreviation for a negative number', () => {
		expect(number_crunch(-1234)).toEqual('-1.2k')
	})
})
