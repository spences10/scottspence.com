import { createServer } from 'node:http';
import type { TestProject } from 'vitest/node';

export default async function setup(project: TestProject) {
	// Kit generates its dev manifest on the first HTTP request. Component
	// tests need those modules before importing remote functions.
	const server = createServer(project.vite.middlewares);
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});

	try {
		const address = server.address();
		if (!address || typeof address === 'string') {
			throw new Error('Missing test server address');
		}

		// This initialises Kit without running application hooks or accessing the database.
		const response = await fetch(
			`http://127.0.0.1:${address.port}/service-worker.js`,
			{ signal: AbortSignal.timeout(30_000) },
		);
		await response.arrayBuffer();
		if (!response.ok && response.status !== 404) {
			throw new Error(
				`SvelteKit test initialisation failed: ${response.status}`,
			);
		}
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
	}
}
