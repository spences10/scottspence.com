import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'bun run build && bun run preview',
    port: 4173,
    timeout: 3 * 60 * 1000,
  },
  testDir: 'tests',
  // projects: [
  //   {
  //     name: 'Chromium',
  //     use: { browserName: 'chromium' },
  //   },
  //   {
  //     name: 'Firefox',
  //     use: { browserName: 'firefox' },
  //   },
  //   {
  //     name: 'WebKit',
  //     use: { browserName: 'webkit' },
  //   },
  // ],
}

export default config
