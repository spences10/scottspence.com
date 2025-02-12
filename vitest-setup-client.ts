import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock window object if it doesn't exist
if (!global.window) {
	global.window = {
		matchMedia: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
		scrollTo: vi.fn(),
		scrollY: 0,
		innerHeight: 768,
	} as any
}

// Mock document object if it doesn't exist
if (!global.document) {
	global.document = {
		...window.document,
		createElement: vi.fn().mockImplementation((tag) => ({
			setAttribute: vi.fn(),
			getElementsByTagName: vi.fn().mockReturnValue([]),
			id: '',
			textContent: '',
			offsetTop: 0,
			animate: vi.fn().mockReturnValue({
				pause: vi.fn(),
				play: vi.fn(),
				finished: Promise.resolve(),
			}),
		})),
	} as any
}

// Mock HTMLElement if it doesn't exist
if (!global.HTMLElement) {
	global.HTMLElement = class HTMLElement {
		animate() {
			return {
				pause: vi.fn(),
				play: vi.fn(),
				finished: Promise.resolve(),
			}
		}
	} as any
}

// add more mocks here if you need them
