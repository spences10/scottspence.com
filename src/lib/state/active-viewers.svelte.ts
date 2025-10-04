interface ActiveViewersData {
	count: number
	page_slug: string
	error?: string
}

interface SiteWideViewersData {
	count: number
	error?: string
}

// Create state object with properties that can be mutated
export const active_viewers_state = $state({
	// Page-specific viewer counts
	page_viewers: new Map<string, ActiveViewersData>(),
	// Site-wide viewer count
	site_wide: { count: 0 } as SiteWideViewersData,
	// Loading states
	loading_pages: new Set<string>(),
	loading_site_wide: false,
	// Cache timestamps
	last_fetched: new Map<string, number>(),
	site_wide_last_fetched: 0,
})

// Getter functions
export function get_page_data(page_slug: string): ActiveViewersData | null {
	return active_viewers_state.page_viewers.get(page_slug) || null
}

export function is_page_loading(page_slug: string): boolean {
	return active_viewers_state.loading_pages.has(page_slug)
}

export function get_site_wide_data(): SiteWideViewersData {
	return active_viewers_state.site_wide
}

export function is_site_wide_loading(): boolean {
	return active_viewers_state.loading_site_wide
}

// Setter functions (to be called by remote functions)
export function set_page_data(page_slug: string, data: ActiveViewersData): void {
	active_viewers_state.page_viewers.set(page_slug, data)
	active_viewers_state.last_fetched.set(page_slug, Date.now())
}

export function set_page_loading(page_slug: string, loading: boolean): void {
	if (loading) {
		active_viewers_state.loading_pages.add(page_slug)
	} else {
		active_viewers_state.loading_pages.delete(page_slug)
	}
}

export function set_site_wide_data(data: SiteWideViewersData): void {
	active_viewers_state.site_wide = data
	active_viewers_state.site_wide_last_fetched = Date.now()
}

export function set_site_wide_loading(loading: boolean): void {
	active_viewers_state.loading_site_wide = loading
}

// Cache check function
export function should_fetch_page_data(page_slug: string, cache_duration: number): boolean {
	const last_fetch = active_viewers_state.last_fetched.get(page_slug) || 0
	return Date.now() - last_fetch >= cache_duration || !active_viewers_state.page_viewers.has(page_slug)
}

export function should_fetch_site_wide_data(cache_duration: number): boolean {
	return Date.now() - active_viewers_state.site_wide_last_fetched >= cache_duration
}

export type { ActiveViewersData, SiteWideViewersData }