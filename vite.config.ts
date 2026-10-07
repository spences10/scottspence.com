import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import mdsvexConfig, { commonmark } from './mdsvex.config.js';
import { code_block_warning_filter } from './src/lib/markdown/highlighter.ts';

const mdsvex_plugins = mdsvex(mdsvexConfig);
// next.1 also matches asset queries. Keep raw Markdown for publishing feeds
// until mdsvex excludes ?raw and ?url itself.
for (const plugin of mdsvex_plugins) {
	if (
		plugin.name === 'mdsvex' &&
		typeof plugin.transform === 'function'
	) {
		const transform = plugin.transform;
		plugin.transform = function (source, id, options) {
			if (/[?&](?:raw|url)(?:[=&]|$)/.test(id)) return;
			return transform.call(this, source, id, options);
		};
	}
}

let warned_mdsvex_sourcemap = false;

export default defineConfig(({ command }) => ({
	// Keep warnings and errors, without printing every generated asset.
	logLevel: command === 'build' ? 'warn' : 'info',
	build: {
		rolldownOptions: {
			checks: { bundlerTimings: false },
			onLog(level, log, default_handler) {
				// mdsvex next.1 generates its maps in a later plugin. Report the
				// missing transform map once, rather than once per document.
				if (
					log.code === 'SOURCEMAP_BROKEN' &&
					log.plugin === 'mdsvex'
				) {
					if (warned_mdsvex_sourcemap) return;
					warned_mdsvex_sourcemap = true;
				}
				default_handler(level, log);
			},
		},
	},
	plugins: [
		tailwindcss(),
		commonmark,
		mdsvex_plugins,
		sveltekit({
			adapter: adapter(),
			dynamicCompileOptions({ filename, code }) {
				if (/\.(?:md|svx)$/.test(filename)) {
					return { warningFilter: code_block_warning_filter(code) };
				}
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
			preprocess: [vitePreprocess()],
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
}));
