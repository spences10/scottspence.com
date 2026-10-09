import { describe, expect, it } from 'vitest';
import { smooth_curve } from './stats.svelte';

describe('smooth_curve', () => {
	const points = [
		{ x: 0, y: 10 },
		{ x: 1, y: 400 },
		{ x: 2, y: 90 },
		{ x: 3, y: 90 },
		{ x: 4, y: 180 },
	];

	it('should pass through every original point', () => {
		const curve = smooth_curve(points, 4);

		points.forEach((point, index) => {
			expect(curve[index * 4].x).toBeCloseTo(point.x);
			expect(curve[index * 4].y).toBeCloseTo(point.y);
		});
	});

	it('should keep x running forwards, so a ridge never curls', () => {
		const curve = smooth_curve(points);

		curve.slice(1).forEach((point, index) => {
			expect(point.x).toBeGreaterThan(curve[index].x);
		});
	});

	it('should never overshoot the values either side', () => {
		const steps = 8;
		const curve = smooth_curve(points, steps);

		curve.forEach((point, index) => {
			const segment = Math.min(
				Math.floor(index / steps),
				points.length - 2,
			);
			const low = Math.min(points[segment].y, points[segment + 1].y);
			const high = Math.max(points[segment].y, points[segment + 1].y);
			expect(point.y).toBeGreaterThanOrEqual(low - 1e-9);
			expect(point.y).toBeLessThanOrEqual(high + 1e-9);
		});
	});

	it('should leave too few points to curve as they are', () => {
		const pair = points.slice(0, 2);

		expect(smooth_curve(pair)).toEqual(pair);
	});
});
