import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { userEvent } from 'vitest/browser';
import { track_article_links } from './article-link-tracking';
import { track_click } from './track-click.remote';

vi.mock('./track-click.remote', () => ({
	track_click: vi.fn(() => Promise.resolve()),
}));

describe('article link tracking', () => {
	let wrapper: HTMLDivElement;
	let content: HTMLDivElement;
	let link: HTMLAnchorElement;
	let cleanup: () => void;
	let original_url: string;
	let prevented_before_navigation: boolean[];

	beforeEach(() => {
		original_url = window.location.href;
		history.replaceState(
			null,
			'',
			'/posts/source-post/?secret=hidden#section',
		);
		wrapper = document.createElement('div');
		content = document.createElement('div');
		link = document.createElement('a');
		link.href = '/posts/destination-post/?secret=hidden#details';
		link.innerHTML = '<strong>Read the follow-up</strong>';
		content.append(link);
		wrapper.append(content);
		document.body.append(wrapper);
		cleanup = track_article_links(content);
		prevented_before_navigation = [];

		// Stop the test iframe navigating, after the tracker has handled the event.
		const stop_navigation = (event: MouseEvent) => {
			prevented_before_navigation.push(event.defaultPrevented);
			event.preventDefault();
		};
		wrapper.addEventListener('click', stop_navigation);
		wrapper.addEventListener('auxclick', stop_navigation);
	});

	afterEach(() => {
		cleanup();
		wrapper.remove();
		history.replaceState(null, '', original_url);
		vi.restoreAllMocks();
	});

	const expect_article_click = () => {
		expect(track_click).toHaveBeenCalledExactlyOnceWith({
			event_name: 'article link click',
			path: '/posts/source-post',
			context: {
				destination: '/posts/destination-post',
				placement: 'article',
			},
		});
		expect(prevented_before_navigation).toEqual([false]);
	};

	it('records one ordinary click on nested link text without blocking navigation', async () => {
		await userEvent.click(link.querySelector('strong')!);
		expect_article_click();
	});

	it('records keyboard activation once without blocking navigation', async () => {
		link.focus();
		await userEvent.keyboard('{Enter}');
		expect_article_click();
	});

	it.each(['ctrlKey', 'metaKey', 'shiftKey'])(
		'records a %s click without changing its default behaviour',
		(modifier) => {
			link.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					[modifier]: true,
				}),
			);
			expect_article_click();
		},
	);

	it('records a middle click once, not as both click and auxclick', () => {
		link.dispatchEvent(
			new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				button: 1,
			}),
		);
		link.dispatchEvent(
			new MouseEvent('auxclick', {
				bubbles: true,
				cancelable: true,
				button: 1,
			}),
		);
		expect(track_click).toHaveBeenCalledTimes(1);
		expect(prevented_before_navigation).toEqual([false, false]);
	});

	it('accepts canonical absolute URLs on a local or preview origin', () => {
		link.href =
			'https://scottspence.com/posts/destination-post?secret=hidden#details';
		link.click();
		expect_article_click();
	});

	it.each([
		'https://example.com/posts/destination-post',
		'https://scottspence.com.evil.example/posts/destination-post',
		'/posts/source-post#section',
		'#section',
		'/contact',
		'/posts',
		'mailto:hello@example.com',
		'http://[invalid',
	])('ignores non-article or same-page link %s', (href) => {
		link.setAttribute('href', href);
		link.dispatchEvent(
			new MouseEvent('click', { bubbles: true, cancelable: true }),
		);
		expect(track_click).not.toHaveBeenCalled();
	});

	it('ignores downloads and banners that have their own tracking', () => {
		link.setAttribute('download', 'post');
		link.click();
		link.removeAttribute('download');
		content.setAttribute('role', 'banner');
		link.click();
		expect(track_click).not.toHaveBeenCalled();
	});

	it('ignores cancelled clicks and right clicks', () => {
		const cancelled = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
		});
		cancelled.preventDefault();
		link.dispatchEvent(cancelled);
		link.dispatchEvent(
			new MouseEvent('auxclick', {
				bubbles: true,
				cancelable: true,
				button: 2,
			}),
		);
		expect(track_click).not.toHaveBeenCalled();
	});

	it('uses the current source path after client-side navigation', () => {
		history.replaceState(
			null,
			'',
			'/posts/another-post?secret=hidden',
		);
		link.click();
		expect(track_click).toHaveBeenCalledWith(
			expect.objectContaining({
				path: '/posts/another-post',
			}),
		);
	});

	it('removes both listeners when the article is unmounted', () => {
		cleanup();
		link.click();
		link.dispatchEvent(
			new MouseEvent('auxclick', {
				bubbles: true,
				cancelable: true,
				button: 1,
			}),
		);
		expect(track_click).not.toHaveBeenCalled();
	});

	it('keeps navigation available when tracking fails', async () => {
		const warning = vi
			.spyOn(console, 'warn')
			.mockImplementation(() => {});
		vi.mocked(track_click).mockRejectedValueOnce(
			new Error('Offline'),
		);
		link.click();
		await vi.waitFor(() =>
			expect(warning).toHaveBeenCalledWith(
				'Could not record article link click',
			),
		);
		expect_article_click();
	});
});
