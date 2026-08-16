import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return Response.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
};
