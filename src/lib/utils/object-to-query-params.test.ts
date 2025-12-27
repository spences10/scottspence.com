import { describe, expect, it } from 'vitest'
import { object_to_query_params } from './object-to-query-params'

describe('object_to_query_params', () => {
	it('should return empty string for empty object', () => {
		const input = {}
		const result = object_to_query_params(input)

		expect(result).toEqual('?')
	})

	it('should return query parameters for object with one key-value pair', () => {
		const input = { id: 123 }
		const result = object_to_query_params(input)

		expect(result).toEqual('?id=123')
	})

	it('should return query parameters for object with multiple key-value pairs', () => {
		const input = { id: 123, name: 'John' }
		const result = object_to_query_params(input)

		expect(result).toEqual('?id=123&name=John')
	})

	it('should return query parameters for array', () => {
		const input = [1, 2, 3]
		const result = object_to_query_params(input)

		expect(result).toEqual('?0=1&1=2&2=3')
	})
})
