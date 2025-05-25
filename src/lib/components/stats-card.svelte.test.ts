import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import StatsCard from './stats-card.svelte'

describe('StatsCard', () => {
	function renderStatsCard(
		daily_visits: AnalyticsData | null | undefined,
		monthly_visits: AnalyticsData | null | undefined,
		yearly_visits: AnalyticsData | null | undefined,
	) {
		return render(StatsCard, {
			props: {
				daily_visits,
				monthly_visits,
				yearly_visits,
			},
		})
	}

	it('should render stats correctly', () => {
		const daily_visits = {
			visits: '100',
			uniques: '50',
			pageviews: '200',
			avg_duration: null,
			bounce_rate: 0.2,
			date: '2023-06-15',
			pathname: '/',
		}

		const { container } = renderStatsCard(daily_visits, null, null)

		expect(
			container.textContent?.includes('Entries Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('100')).toBeTruthy()
		expect(
			container.textContent?.includes('Visitors Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('50')).toBeTruthy()
		expect(
			container.textContent?.includes('Views Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('200')).toBeTruthy()
	})

	it('should render stats for different time periods', () => {
		const daily_visits = {
			visits: '100',
			uniques: '50',
			pageviews: '200',
			avg_duration: null,
			bounce_rate: 0.2,
			date: '2023-06-15',
			pathname: '/',
		}

		const monthly_visits = {
			visits: '1000',
			uniques: '500',
			pageviews: '2000',
			avg_duration: null,
			bounce_rate: 0.2,
			date: '2023-06-01',
			pathname: '/',
		}

		const yearly_visits = {
			visits: '10000',
			uniques: '5000',
			pageviews: '20000',
			avg_duration: null,
			bounce_rate: 0.2,
			date: '2023-01-01',
			pathname: '/',
		}

		const { container } = renderStatsCard(
			daily_visits,
			monthly_visits,
			yearly_visits,
		)

		// For daily visits
		expect(
			container.textContent?.includes('Entries Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('100')).toBeTruthy()
		expect(
			container.textContent?.includes('Visitors Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('50')).toBeTruthy()
		expect(
			container.textContent?.includes('Views Today'),
		).toBeTruthy()
		expect(container.textContent?.includes('200')).toBeTruthy()

		// For monthly visits
		expect(
			container.textContent?.includes('Entries This Month'),
		).toBeTruthy()
		expect(container.textContent?.includes('1k')).toBeTruthy()
		expect(
			container.textContent?.includes('Visitors This Month'),
		).toBeTruthy()
		expect(container.textContent?.includes('500')).toBeTruthy()
		expect(
			container.textContent?.includes('Views This Month'),
		).toBeTruthy()
		expect(container.textContent?.includes('2k')).toBeTruthy()

		// For yearly visits
		expect(
			container.textContent?.includes('Entries This Year'),
		).toBeTruthy()
		expect(container.textContent?.includes('10k')).toBeTruthy()
		expect(
			container.textContent?.includes('Visitors This Year'),
		).toBeTruthy()
		expect(container.textContent?.includes('5k')).toBeTruthy()
		expect(
			container.textContent?.includes('Views This Year'),
		).toBeTruthy()
		expect(container.textContent?.includes('20k')).toBeTruthy()
	})
})
