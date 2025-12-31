import { describe, expect, it } from 'vitest'
import {
	rejected_extensions,
	rejected_paths,
} from './reject-patterns'

describe('reject patterns', () => {
	describe('rejected_extensions', () => {
		it('should contain common unsafe file extensions', () => {
			expect(rejected_extensions).toContain('.php')
			expect(rejected_extensions).toContain('.exe')
			expect(rejected_extensions).toContain('.env')
		})

		it('should not allow empty extensions', () => {
			expect(rejected_extensions.includes('')).toBe(false)
		})

		it('should all start with a dot', () => {
			rejected_extensions.forEach((ext) => {
				expect(ext.startsWith('.')).toBe(true)
			})
		})
	})

	describe('rejected_paths', () => {
		it('should contain common unsafe paths', () => {
			expect(rejected_paths).toContain('/wp-admin')
			expect(rejected_paths).toContain('/phpmyadmin')
			expect(rejected_paths).toContain('/admin')
		})

		it('should all start with a forward slash', () => {
			rejected_paths.forEach((path) => {
				expect(path.startsWith('/')).toBe(true)
			})
		})

		it('should not contain trailing slashes', () => {
			rejected_paths.forEach((path) => {
				expect(path.endsWith('/')).toBe(false)
			})
		})
	})
})
