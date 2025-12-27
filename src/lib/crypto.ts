import { SECRET_PASSPHRASE } from '$env/static/private'
import crypto from 'node:crypto'

const algorithm = 'aes-256-cbc'

function get_secret_key(): Buffer {
	// Create a 32-byte key from the passphrase
	return crypto
		.createHash('sha256')
		.update(SECRET_PASSPHRASE)
		.digest()
}

export function encrypt(text: string): string {
	const iv = crypto.randomBytes(16)
	const key = get_secret_key()
	const cipher = crypto.createCipheriv(algorithm, key, iv)
	let encrypted = cipher.update(text, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	return `${iv.toString('hex')}:${encrypted}`
}

export function decrypt(text: string): string {
	const [iv_hex, encrypted_hex] = text.split(':')
	const iv = Buffer.from(iv_hex, 'hex')
	const key = get_secret_key()
	const decipher = crypto.createDecipheriv(algorithm, key, iv)
	let decrypted = decipher.update(encrypted_hex, 'hex', 'utf8')
	decrypted += decipher.final('utf8')
	return decrypted
}
