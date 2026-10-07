import { spawn } from 'node:child_process';
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type {
	ConfigurationParams,
	DocumentDiagnosticReport,
} from 'vscode-languageserver-protocol';
import {
	createMessageConnection,
	StreamMessageReader,
	StreamMessageWriter,
} from 'vscode-jsonrpc/node';
import { highlight_options } from '../src/lib/markdown/highlighter.ts';

// The language server reads the mdsvex manifest, which has no highlight
// options. The build knows these fence names, so their warning is false.
const site_languages = new Set(
	Object.keys(highlight_options.languages ?? {}),
);
const unknown_language = /^no highlighter for the language (\S+),/;

// Use the published language server bundle. Its next.1 bin uses require in
// an ESM .js file, so start its CommonJS bundle directly until upstream fixes it.
const bundle = fileURLToPath(
	new URL(
		'../dist/server.cjs',
		import.meta.resolve('@mdsvex/language-server'),
	),
);
const server = spawn(process.execPath, [bundle, '--stdio'], {
	stdio: ['pipe', 'pipe', 'inherit'],
});
const connection = createMessageConnection(
	new StreamMessageReader(server.stdout),
	new StreamMessageWriter(server.stdin),
);
connection.onRequest(
	'workspace/configuration',
	({ items }: ConfigurationParams) => items.map(() => null),
);
connection.onRequest('client/registerCapability', () => null);
connection.onRequest('window/workDoneProgress/create', () => null);
server.on('exit', (code) => {
	if (code && code !== 0) {
		console.error(`PFM language server exited with code ${code}.`);
		connection.dispose();
		process.exitCode = 1;
	}
});
connection.listen();
const timeout = setTimeout(() => {
	console.error('Post type checks timed out.');
	server.kill();
	process.exitCode = 1;
}, 120_000);

try {
	const root_uri = pathToFileURL(process.cwd() + '/').href;
	await connection.sendRequest('initialize', {
		processId: process.pid,
		rootUri: root_uri,
		workspaceFolders: [{ uri: root_uri, name: 'scottspence.com' }],
		capabilities: {
			workspace: { configuration: true, workspaceFolders: true },
			textDocument: { diagnostic: { dynamicRegistration: false } },
		},
		initializationOptions: {
			typescript: {
				tsdk: fileURLToPath(
					new URL('.', import.meta.resolve('typescript')),
				),
			},
		},
	});
	await connection.sendNotification('initialized', {});
	const files = globSync([
		'posts/*.md',
		'copy/*.md',
		'newsletter/*.md',
	]).filter((file) => path.basename(file) !== 'README.md');
	let errors = 0;
	let warnings = 0;
	for (const file of files) {
		const uri = pathToFileURL(path.resolve(file)).href;
		await connection.sendNotification('textDocument/didOpen', {
			textDocument: {
				uri,
				languageId: 'pfm',
				version: 1,
				text: readFileSync(file, 'utf8'),
			},
		});
		const result =
			await connection.sendRequest<DocumentDiagnosticReport>(
				'textDocument/diagnostic',
				{ textDocument: { uri } },
			);
		for (const diagnostic of result.kind === 'full'
			? result.items
			: []) {
			if (diagnostic.severity !== 1 && diagnostic.severity !== 2)
				continue;
			const language = unknown_language.exec(diagnostic.message)?.[1];
			if (language && site_languages.has(language)) continue;
			if (diagnostic.severity === 1) errors++;
			else warnings++;
			console.error(
				`${file}:${diagnostic.range.start.line + 1}:${diagnostic.range.start.character + 1} ${diagnostic.severity === 1 ? 'error' : 'warning'}: ${diagnostic.message}`,
			);
		}
		await connection.sendNotification('textDocument/didClose', {
			textDocument: { uri },
		});
	}
	console.log(
		`Checked ${files.length} PFM documents: ${errors} errors, ${warnings} warnings.`,
	);
	if (errors || warnings) process.exitCode = 1;
} finally {
	clearTimeout(timeout);
	connection.dispose();
	server.kill();
}
