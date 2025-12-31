import { expect, test } from 'vitest'
import {
	limit_requests,
	limit_window,
	reactions,
} from './reactions-config'

test('reactions array contains the correct number of reactions', () => {
	expect(reactions).toHaveLength(4)
})

test('each reaction has the correct properties', () => {
	reactions.forEach((reaction) => {
		expect(reaction).toHaveProperty('type')
		expect(reaction).toHaveProperty('emoji')
		expect(typeof reaction.type).toBe('string')
		expect(typeof reaction.emoji).toBe('string')
	})
})

test('reactions contain expected types', () => {
	const expectedTypes = ['likes', 'hearts', 'poops', 'parties']
	const actualTypes = reactions.map((reaction) => reaction.type)
	expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes))
})

test('reactions contain expected emojis', () => {
	const expectedEmojis = ['👍', '❤️', '💩', '🎉']
	const actualEmojis = reactions.map((reaction) => reaction.emoji)
	expect(actualEmojis).toEqual(expect.arrayContaining(expectedEmojis))
})

test('limit_requests is a number', () => {
	expect(typeof limit_requests).toBe('number')
})

test('limit_requests is 10', () => {
	expect(limit_requests).toBe(10)
})

test('limit_window is a string', () => {
	expect(typeof limit_window).toBe('string')
})

test('limit_window is "10 s"', () => {
	expect(limit_window).toBe('10 s')
})
