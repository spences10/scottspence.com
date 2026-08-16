import { error } from '@sveltejs/kit';

export const load = async () => {
	try {
		// @ts-ignore
		const Copy = await import(`../../../copy/uses.md`);
		return {
			Copy: Copy.default,
		};
	} catch {
		error(404, 'Uh oh!');
	}
};
