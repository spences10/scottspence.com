/* eslint-disable no-unused-vars */

declare interface Post {
	date: string;
	title: string;
	tags: string[];
	is_private: boolean;
	reading_time: {
		text: string;
		minutes: number;
		time: number;
		words: number;
	};
	reading_time_text: string;
	preview_html: string;
	preview: string;
	previewHtml: string;
	slug: string | null;
	path: string;
}

declare interface AnalyticsData {
	visits: string;
	uniques: string;
	pageviews: string;
	avg_duration: string | null;
	bounce_rate: number;
	date: string;
	pathname: string;
	total?: number;
	content?: string;
}

declare interface PopularPost {
	id: string;
	pathname: string;
	title: string;
	pageviews: number;
	visits: number;
	date_grouping: string;
	last_updated: string;
}

declare interface PopularPosts {
	popular_posts_daily: PopularPost[];
	popular_posts_monthly: PopularPost[];
	popular_posts_yearly: PopularPost[];
}

declare interface VisitorsData {
	visitor_data: Array<{
		pathname: string;
		title: string;
		recent_visitors: number;
	}>;
}

declare interface Fetch {
	(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

declare interface ReactionCount {
	[key: string]: number;
}

declare interface ReactionsData {
	path?: string;
	count: ReactionCount;
}

declare interface ReactionEntry {
	path: string;
	[key: string]: number | string;
}

declare interface ReactionPage {
	rank?: number;
	path: string;
	count: number;
}

declare interface SubscriberData {
	newsletter_subscriber_count?: number;
	error?: string;
}

declare interface PostAnalytics {
	daily: any | null;
	monthly: any | null;
	yearly: any | null;
	history?: PostMonthlyViews[];
	launch?: PostLaunch | null;
	reactions?: PostReactionsSummary | null;
}

declare interface PostMonthlyViews {
	month: string;
	views: number;
	visitors: number;
}

declare interface PostLaunch {
	/** Cumulative views by day since first view */
	cumulative: (number | null)[];
	/** Median cumulative views of recent launches with a full window */
	median: (number | null)[];
	days_live: number;
	/** 0-based day the rank compares at */
	day: number;
	rank: number;
	cohort_size: number;
}

declare interface LaunchBoard {
	launches: {
		slug: string;
		title: string;
		pub: string;
		/** Views in the first `days` days, or so far if younger */
		views: number;
		days_live: number;
	}[];
	days: number;
	median: number | null;
}

declare interface PostMover {
	slug: string;
	title: string;
	pub: string;
	recent: number;
	previous: number;
	change: number;
}

declare interface PostMovers {
	risers: PostMover[];
	fallers: PostMover[];
	window_days: number;
	/** First day of the recent window */
	recent_from: string;
	last_date: string;
}

declare interface PostReactionsSummary {
	total: number;
	by_type: Record<string, number>;
	per_1k_views: number | null;
	site_per_1k_views: number | null;
}

declare interface RelatedPost {
	slug: string;
	title: string;
}

// https://stackoverflow.com/questions/73025100/svelte-svelte-kit-type-custom-action-event-with-typescript
// https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-getting-deprecation-warnings-for-sveltejsx--i-want-to-migrate-to-the-new-typings
declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		onenter_viewport?: (event: any) => any;
		onexit_viewport?: (event: any) => any;
		onanimation_end?: (event: any) => any;
	}
}
