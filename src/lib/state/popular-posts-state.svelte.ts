class PopularPostsState {
	data = $state<PopularPosts>({
		popular_posts_daily: [],
		popular_posts_monthly: [],
		popular_posts_yearly: [],
	})

	set(new_data: PopularPosts | undefined) {
		this.data = new_data || {
			popular_posts_daily: [],
			popular_posts_monthly: [],
			popular_posts_yearly: [],
		}
	}

	get_daily() {
		return this.data.popular_posts_daily
	}

	get_monthly() {
		return this.data.popular_posts_monthly
	}

	get_yearly() {
		return this.data.popular_posts_yearly
	}
}

// Single universal instance shared everywhere
export const popular_posts_state = new PopularPostsState()
