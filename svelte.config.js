import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import adapter from 'svelte-adapter-bun'
import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],

  kit: {
    adapter: adapter(),
    csrf: { checkOrigin: false },
  },
}

export default config
