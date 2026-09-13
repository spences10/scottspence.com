import { website } from '#lib/info.js';
import { on } from 'svelte/events';
import { track_click } from './track-click.remote';

export const track_article_links = (element: HTMLElement) => {
	const handle_click = (event: MouseEvent) => {
		if (
			event.defaultPrevented ||
			(event.type === 'click'
				? event.button !== 0
				: event.button !== 1)
		) {
			return;
		}

		const anchor =
			event.target instanceof Element
				? event.target.closest('a[href]')
				: null;
		if (
			!(anchor instanceof HTMLAnchorElement) ||
			anchor.hasAttribute('download') ||
			anchor.closest('[role="banner"]')
		) {
			return;
		}

		let destination: URL;
		try {
			destination = new URL(anchor.href);
		} catch {
			return;
		}

		const source_path = window.location.pathname.replace(/\/$/, '');
		const destination_path = destination.pathname.replace(/\/$/, '');
		if (
			![window.location.origin, website].includes(
				destination.origin,
			) ||
			!/^\/posts\/[a-z0-9-]+$/.test(destination_path) ||
			destination_path === source_path
		) {
			return;
		}

		void track_click({
			event_name: 'article link click',
			path: source_path,
			context: {
				destination: destination_path,
				placement: 'article',
			},
		}).catch(() => {
			console.warn('Could not record article link click');
		});
	};

	const remove_click = on(element, 'click', handle_click);
	const remove_auxclick = on(element, 'auxclick', handle_click);

	return () => {
		remove_click();
		remove_auxclick();
	};
};
