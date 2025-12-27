import { describe, expect, test } from 'vitest'
import {
	PEOPLE,
	SITE_LINKS,
	SOCIAL_LINKS,
	description,
	name,
	website,
} from './info'

describe('info', () => {
	test('name should be a string', () => {
		expect(typeof name).toBe('string')
	})

	test('website should be a string', () => {
		expect(typeof website).toBe('string')
	})

	test('description should be a string', () => {
		expect(typeof description).toBe('string')
	})

	// popular posts now comes from endpoint

	test('SOCIAL_LINKS should be an array', () => {
		expect(Array.isArray(SOCIAL_LINKS)).toBe(true)
	})

	test('SOCIAL_LINKS should have at least one link', () => {
		expect(SOCIAL_LINKS.length).toBeGreaterThan(0)
	})

	test('each social link should have a title and link', () => {
		SOCIAL_LINKS.forEach(link => {
			expect(link.title).toBeDefined()
			expect(typeof link.title).toBe('string')
			expect(link.link).toBeDefined()
			expect(typeof link.link).toBe('string')
		})
	})

	test('SITE_LINKS should be an array', () => {
		expect(Array.isArray(SITE_LINKS)).toBe(true)
	})

	test('SITE_LINKS should have at least one link', () => {
		expect(SITE_LINKS.length).toBeGreaterThan(0)
	})

	test('PEOPLE should be an array', () => {
		expect(Array.isArray(PEOPLE)).toBe(true)
	})

	test('PEOPLE should have at least one person', () => {
		expect(PEOPLE.length).toBeGreaterThan(0)
	})

	test('each person should have a name and link', () => {
		PEOPLE.forEach(person => {
			expect(person.name).toBeDefined()
			expect(typeof person.name).toBe('string')
			expect(person.link).toBeDefined()
			expect(typeof person.link).toBe('string')
		})
	})
})
