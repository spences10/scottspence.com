import { building } from '$app/env';
import {
	UPSTASH_REDIS_REST_TOKEN,
	UPSTASH_REDIS_REST_URL,
} from '$app/env/private';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis;
let ratelimit: Ratelimit;

if (!building) {
	redis = new Redis({
		url: UPSTASH_REDIS_REST_URL,
		token: UPSTASH_REDIS_REST_TOKEN,
	});

	ratelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(10, '10 s'),
	});
}

export { ratelimit, redis };
