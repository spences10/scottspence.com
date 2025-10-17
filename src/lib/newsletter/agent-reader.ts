import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Read and parse the newsletter agent file from .claude/agents/
 * Removes frontmatter (---...---) and returns the agent instructions
 */
export function read_agent_prompt(): string {
	const agent_path = join(
		__dirname,
		'../../.claude/agents/newsletter-generator.md',
	)

	const content = readFileSync(agent_path, 'utf-8')

	// Remove frontmatter (---...---)
	const lines = content.split('\n')
	const start = lines.findIndex((line) => line === '---')
	const end = lines.findIndex(
		(line, i) => i > start && line === '---',
	)

	if (start === -1 || end === -1) {
		throw new Error('Agent file missing frontmatter delimiters')
	}

	return lines
		.slice(end + 1)
		.join('\n')
		.trim()
}
