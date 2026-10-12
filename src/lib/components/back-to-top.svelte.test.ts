import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
// The button is only fixed to the viewport with the site styles loaded
import '../../app.css';
import BackToTop from './back-to-top.svelte';

let tall_element: HTMLDivElement | undefined;

// Make the page scrollable in the real browser environment
const add_scrollable_content = () => {
	tall_element = document.createElement('div');
	tall_element.style.height = '2000px';
	document.body.appendChild(tall_element);
};

// Scroll for real and wait for the browser's own scroll event.
// Dispatching a synthetic event as well runs the component's handler
// twice at one position, which reads as "not scrolling down" and
// hides the button again.
const scroll_to = async (top: number) => {
	if (window.scrollY === top) return;
	const scrolled = new Promise((resolve) =>
		window.addEventListener('scroll', resolve, { once: true }),
	);
	window.scrollTo({ top, behavior: 'instant' });
	await scrolled;
};

afterEach(async () => {
	vi.restoreAllMocks();
	// Settle back at the top before the next test so no scroll event
	// is left pending, then remove the content
	await scroll_to(0);
	tall_element?.remove();
	tall_element = undefined;
});

describe('BackToTop Component', () => {
	describe('Initial Rendering', () => {
		test('renders button with correct initial state', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveTextContent('Back to top');
			await expect.element(button).toHaveClass('hide-button');
			await expect.element(button).not.toHaveClass('show-button');
		});

		test('has correct accessibility attributes', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			await expect.element(button).toHaveAttribute('type', 'button');
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top');
		});

		test('has correct CSS classes', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			await expect.element(button).toHaveClass('btn');
			await expect.element(button).toHaveClass('btn-secondary');
			await expect
				.element(button)
				.toHaveClass('text-secondary-content');
			await expect.element(button).toHaveClass('rounded-box');
			await expect.element(button).toHaveClass('fixed');
			await expect.element(button).toHaveClass('right-5');
		});

		test('has correct positioning classes', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			await expect.element(button).toHaveClass('-bottom-8');
			await expect.element(button).toHaveClass('back-to-top-button');
			await expect.element(button).toHaveClass('font-normal');
			await expect.element(button).toHaveClass('normal-case');
		});
	});

	describe('Scroll Behavior', () => {
		test('shows button when scrolling down', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Initially hidden
			await expect.element(button).toHaveClass('hide-button');

			await scroll_to(100);

			// Button should become visible when scrolling down
			await expect.element(button).toHaveClass('show-button');
		});

		test('hides button when scrolling up', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Scroll down first to show button
			await scroll_to(200);
			await expect.element(button).toHaveClass('show-button');

			// Then scroll up
			await scroll_to(100);

			// Button should be hidden when scrolling up
			await expect.element(button).toHaveClass('hide-button');
		});

		test('hides button when at top of page', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Scroll down first
			await scroll_to(100);
			await expect.element(button).toHaveClass('show-button');

			// Then scroll to top
			await scroll_to(0);

			await expect.element(button).toHaveClass('hide-button');
		});

		test('remains hidden when scrolling down from position 0', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Should be hidden initially, at the top
			expect(window.scrollY).toBe(0);
			await expect.element(button).toHaveClass('hide-button');

			// Now scroll down from 0
			await scroll_to(50);

			// Should now be visible since we scrolled down from 0
			await expect.element(button).toHaveClass('show-button');
		});
	});

	describe('Edge Cases', () => {
		test('handles rapid scroll events correctly', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Rapid scroll sequence: down, up, down, up, down
			const scroll_positions = [100, 50, 150, 75, 200];

			for (const position of scroll_positions) {
				await scroll_to(position);
			}

			// Final position is 200, which should show button (scrolled down from 75)
			await expect.element(button).toHaveClass('show-button');
		});

		test('handles scroll position exactly at 0', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Start at position 100
			await scroll_to(100);
			await expect.element(button).toHaveClass('show-button');

			// Scroll to exactly 0
			await scroll_to(0);

			// Should be hidden when at position 0
			await expect.element(button).toHaveClass('hide-button');
		});

		test('handles very small scroll movements', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Very small scroll down (1 pixel) from the top
			expect(window.scrollY).toBe(0);
			await scroll_to(1);

			// Should show button even for 1px scroll down
			await expect.element(button).toHaveClass('show-button');
		});

		test('handles scroll events without scrollable content', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Nothing to scroll, so the browser fires no scroll event of
			// its own; dispatch one to exercise the handler
			window.scrollTo({ top: 100, behavior: 'instant' });
			window.dispatchEvent(new Event('scroll'));

			// Should remain hidden since scrollY will be 0
			expect(window.scrollY).toBe(0);
			await expect.element(button).toHaveClass('hide-button');
		});
	});

	describe('User Interactions', () => {
		test('scrolls to top when clicked', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// First scroll down to show the button
			await scroll_to(500);
			await expect.element(button).toHaveClass('show-button');

			const scroll_to_spy = vi.spyOn(window, 'scrollTo');

			// click() waits for the fly-in animation to settle
			await button.click();

			expect(scroll_to_spy).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			});

			// The page really does end up back at the top
			await expect
				.poll(() => window.scrollY, { timeout: 5000 })
				.toBe(0);
		});

		test('button is clickable when visible', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Scroll down to show button
			await scroll_to(200);

			await expect.element(button).toHaveClass('show-button');

			// Button should be visible, enabled and clickable
			await expect.element(button).toBeVisible();
			await expect.element(button).toBeEnabled();
			await expect.element(button).not.toHaveAttribute('disabled');
		});

		test('button maintains accessibility when state changes', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Check accessibility attributes in hidden state
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top');
			await expect.element(button).toHaveAttribute('type', 'button');

			// Scroll down to show button
			await scroll_to(200);
			await expect.element(button).toHaveClass('show-button');

			// Check accessibility attributes in visible state
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top');
			await expect.element(button).toHaveAttribute('type', 'button');
		});
	});

	describe('Animation States', () => {
		test('applies correct animation classes for show state', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Initially should have hide-button class
			await expect.element(button).toHaveClass('hide-button');
			await expect.element(button).not.toHaveClass('show-button');

			// Scroll down to trigger show state
			await scroll_to(150);

			// Should now have show-button class and not hide-button
			await expect.element(button).toHaveClass('show-button');
			await expect.element(button).not.toHaveClass('hide-button');
		});

		test('transitions between animation states correctly', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Start hidden
			await expect.element(button).toHaveClass('hide-button');

			// Show button
			await scroll_to(200);
			await expect.element(button).toHaveClass('show-button');
			await expect.element(button).not.toHaveClass('hide-button');

			// Hide button again
			await scroll_to(100);
			await expect.element(button).toHaveClass('hide-button');
			await expect.element(button).not.toHaveClass('show-button');
		});
	});

	describe('Responsive Behavior', () => {
		test('maintains functionality across different viewport sizes', async () => {
			add_scrollable_content();
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// Test at mobile viewport (the component should work the same)
			// Note: In vitest-browser-svelte, we can't easily change viewport size,
			// but we can test that the component maintains its core functionality
			await scroll_to(300);

			// Should work regardless of viewport size
			await expect.element(button).toHaveClass('show-button');
		});

		test('maintains positioning classes for responsive design', async () => {
			render(BackToTop);
			const button = page.getByTestId('back-to-top');

			// These classes should always be present for responsive behavior
			await expect.element(button).toHaveClass('fixed');
			await expect.element(button).toHaveClass('right-5');
			await expect.element(button).toHaveClass('-bottom-8');
		});
	});
});
