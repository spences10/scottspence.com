/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import { vi } from 'vitest'

// Mock environment variables for tests
vi.mock('$env/static/public', () => ({
	PUBLIC_FATHOM_ID: 'test-fathom-id',
	PUBLIC_FATHOM_URL: 'https://test-fathom.com',
	PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
}))
