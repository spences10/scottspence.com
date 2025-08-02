import {
	TURSO_DB_AUTH_TOKEN,
	TURSO_DB_URL,
} from '$env/static/private'
import { createClient, type Client } from '@libsql/client'

export const turso_client = (): Client => {
	const remote_url = TURSO_DB_URL?.trim()
	if (remote_url === undefined) {
		throw new Error('TURSO_DB_URL is not defined')
	}

	const auth_token = TURSO_DB_AUTH_TOKEN?.trim()
	if (auth_token === undefined) {
		throw new Error('TURSO_DB_AUTH_TOKEN is not defined')
	}

	return createClient({
		url: remote_url,
		authToken: auth_token,
	})
}

export const sync_turso_replica = async (): Promise<void> => {
	console.log('Direct Turso connection: no sync needed')
}
