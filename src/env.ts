import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
	PUBLIC_FATHOM_ID: { public: true, static: true },
	PUBLIC_FATHOM_URL: { public: true, static: true },
	EMAIL_APP_TO_ADDRESS: { static: true },
	RESEND_API_KEY: { static: true },
	RESEND_AUDIENCE_ID: { static: true },
	RESEND_FROM_EMAIL: { static: true },
	TURNSTILE_SECRET_KEY: { static: true },
	INGEST_TOKEN: { static: true },
	NEWSLETTER_GH_ACTIVITY_TOKEN: { static: true },
	DATABASE_PATH: { static: true },
	VOYAGE_AI_API_KEY: { static: true },
	INDEXNOW_API_KEY: { schema: (input) => input ?? '' },
	PRODUCTION_URL: { static: true },
	SECRET_PASSPHRASE: { static: true },
	EXCHANGE_RATE_API_KEY: { static: true },
	UPSTASH_REDIS_REST_TOKEN: { static: true },
	UPSTASH_REDIS_REST_URL: { static: true },
	PUBLIC_TURNSTILE_SITE_KEY: { public: true, static: true },
	ANALYTICS_SALT: { static: true },
});
