import { dev } from '$app/environment'
import {
	TURSO_DB_AUTH_TOKEN,
	TURSO_DB_URL,
} from '$env/static/private'
import { createClient, type Client } from '@libsql/client'

const LOCAL_DB_PATH = dev
	? './local-dev-replica.db'
	: '/app/data/turso-replica.db'

let client_instance: Client | null = null

export const turso_client = (): Client => {
	if (client_instance) {
		return client_instance
	}

	const remote_url = TURSO_DB_URL?.trim()
	if (remote_url === undefined) {
		throw new Error('TURSO_DB_URL is not defined')
	}

	const auth_token = TURSO_DB_AUTH_TOKEN?.trim()
	if (auth_token === undefined) {
		throw new Error('TURSO_DB_AUTH_TOKEN is not defined')
	}

	client_instance = createClient({
		url: `file:${LOCAL_DB_PATH}`,
		syncUrl: remote_url,
		authToken: auth_token,
		syncInterval: dev ? 60 : 300,
	})

	return client_instance
}

export const sync_turso_replica = async (): Promise<void> => {
	try {
		const client = turso_client()
		if ('sync' in client) {
			await client.sync()
			console.log('Turso replica synced successfully')
		}
	} catch (error) {
		console.error('Failed to sync Turso replica:', error)
	}
}
