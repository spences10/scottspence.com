import { defineConfig } from '@playwright/test'

export default defineConfig({
	timeout: 5000,
	globalSetup: './e2e/global-setup.ts',
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
	},

	testDir: 'e2e',
	projects: [
		{
			name: 'Chromium',
			use: { browserName: 'chromium' },
		},
	],
})
