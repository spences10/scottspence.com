import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import mdsvexConfig from './mdsvex.config.js';

const node_adapter = adapter();

export default defineConfig({
	environments: {
		ssr: {
			build: {
				rolldownOptions: {
					input: {
						'scheduler-worker': 'src/lib/server/scheduler-worker.ts',
					},
				},
			},
		},
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: {
				...node_adapter,
				async adapt(builder) {
					await node_adapter.adapt(builder);
					const initializer =
						builder.createInstrumentationInitializer({
							outputDirectory: 'build/server',
							serverDirectory: 'build/server',
						});
					// Initialise dynamic env before importing task modules. Do not
					// initialise the HTTP server or its analytics timer in the worker.
					writeFileSync(
						'build/scheduler.js',
						`import './server/${basename(initializer)}';\n` +
							`const { start_worker } = await import('./server/scheduler-worker.js');\n` +
							`start_worker();\n`,
					);
				},
			},
			compilerOptions: {
				experimental: {
					async: true,
				},
			},
			csrf: { trustedOrigins: ['https://scottspence.com'] },
			experimental: {
				remoteFunctions: true,
			},
			extensions: ['.svelte', '.md'],
			preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],
		}),
	],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			// posts, copy
			allow: ['..'],
		},
	},
	test: {
		globalSetup: './vitest-global-setup.ts',
		projects: [
			{
				// Client-side tests (Svelte components)
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						ui: false,
						provider: playwright(),
						instances: [
							{
								browser: 'chromium',
								headless: true,
							},
						],
					},
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts'],
				},
			},
			{
				// SSR tests (Server-side rendering)
				extends: './vite.config.ts',
				test: {
					name: 'ssr',
					environment: 'node',
					include: ['src/**/*.ssr.{test,spec}.{js,ts}'],
				},
			},
			{
				// Server-side tests (Node.js utilities)
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: [
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'src/**/*.ssr.{test,spec}.{js,ts}',
					],
				},
			},
		],
	},
	fmt: {
		useTabs: true,
		singleQuote: true,
		printWidth: 70,
		trailingComma: 'all',
		proseWrap: 'always',
		ignorePatterns: [
			'.svelte-kit/**',
			'build/**',
			'test-results/**',
			'data/**',
			'bun.lock',
			'package-lock.json',
			'pnpm-lock.yaml',
			'yarn.lock',
			'.claude/settings.local.json',
		],
		svelte: true,
		sortTailwindcss: {
			stylesheet: './src/app.css',
		},
	},
});
