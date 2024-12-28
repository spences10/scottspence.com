import { defineConfig } from '@playwright/test';

export default defineConfig({
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
		{
			name: 'Firefox',
			use: { browserName: 'firefox' },
		},
		{
			name: 'WebKit',
			use: { browserName: 'webkit' },
		},
	],
});
