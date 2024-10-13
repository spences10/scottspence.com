import {
	EMAIL_APP_PASSWORD,
	EMAIL_APP_TO_ADDRESS,
	EMAIL_APP_USER,
} from '$env/static/private'
import { ratelimit } from '$lib/redis'
import { fail } from '@sveltejs/kit'
import nodemailer from 'nodemailer'

// check for common SQL injection patterns
const contains_sql_injection = (input: string): boolean => {
	const patterns = [
		/(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
		/((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
		/\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
		/((\%27)|(\'))union/i,
		/exec(\s|\+)+(s|x)p\w+/i,
		/UNION(\s+)ALL(\s+)SELECT/i,
		/UNION(\s+)SELECT/i,
		/SELECT.*FROM/i,
		/INSERT(\s+)INTO/i,
		/DELETE(\s+)FROM/i,
		/DROP(\s+)TABLE/i,
		/DBMS_PIPE\.RECEIVE_MESSAGE/i,
	]

	return patterns.some(pattern => pattern.test(input))
}

// sanitize input
const sanitize_input = (input: string): string => {
	if (typeof input !== 'string') return ''
	return (
		input
			// Remove any character that's not alphanumeric, whitespace, @, ., or -
			.replace(/[^\w\s@.-]/gi, '')
			.trim()
	)
}

export const actions = {
	default: async ({ request, getClientAddress }) => {
		const ip = getClientAddress()
		const rate_limit_attempt = await ratelimit.limit(ip)

		if (!rate_limit_attempt.success) {
			const time_remaining = Math.floor(
				(rate_limit_attempt.reset - new Date().getTime()) / 1000,
			)

			return fail(429, {
				error: `Rate limit exceeded. Try again in ${time_remaining} seconds`,
				time_remaining,
			})
		}

		try {
			const data = await request.formData()
			const name = sanitize_input(data.get('name')?.toString() || '')
			const email = sanitize_input(
				data.get('email')?.toString() || '',
			)
			const subject = data.get('subject')?.toString()
			const reason = sanitize_input(
				data.get('reason')?.toString() || '',
			)
			const message = sanitize_input(
				data.get('message')?.toString() || '',
			)

			if (subject) {
				// Honeypot
				console.log(`Potential spam detected from IP: ${ip}`)
				return {
					status: 200,
					body: {
						message: 'Email sent successfully',
					},
				}
			}

			// Check for SQL injection attempts
			if (
				contains_sql_injection(name) ||
				contains_sql_injection(email) ||
				contains_sql_injection(reason) ||
				contains_sql_injection(message)
			) {
				console.log(`SQL injection attempt detected from IP: ${ip}`)
				return fail(400, {
					error: 'Invalid input detected',
				})
			}

			// Basic validation
			if (!name || !email || !reason || !message) {
				return fail(400, {
					error: 'All fields are required',
				})
			}

			// Email validation (basic)
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				return fail(400, {
					error: 'Invalid email format',
				})
			}

			// Create a transporter object using the nodemailer library
			const transporter = nodemailer.createTransport({
				host: 'smtp.fastmail.com',
				port: 465,
				secure: true,
				auth: {
					user: EMAIL_APP_USER,
					pass: EMAIL_APP_PASSWORD,
				},
			})

			// Set up email data
			const mail_options = {
				from: `"${name}" <${email}>`,
				to: EMAIL_APP_TO_ADDRESS,
				subject: `Contact form: ${reason}`,
				text: message,
			}

			// Send email
			const info = await transporter.sendMail(mail_options)

			console.log(`Email sent successfully from ${email} (IP: ${ip})`)

			return {
				status: 200,
				body: {
					message: 'Email sent successfully',
					messageId: info.messageId,
				},
			}
		} catch (error: unknown) {
			console.error(
				`Error in contact form submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
			return fail(500, {
				error: 'Internal server error',
			})
		}
	},
}
