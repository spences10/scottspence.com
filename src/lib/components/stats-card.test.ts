import { cleanup, render } from '@testing-library/svelte'
import { afterEach, describe, expect, it } from 'vitest'
import StatsCard from './stats-card.svelte'

describe.skip('StatsCard', () => {
  afterEach(cleanup)

  function renderStatsCard(
    daily_visits: AnalyticsData | null | undefined,
    monthly_visits: AnalyticsData | null | undefined,
    yearly_visits: AnalyticsData | null | undefined
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

    const { getByText } = renderStatsCard(daily_visits, null, null)

    expect(getByText('Entries Today')).toBeTruthy()
    expect(getByText('100')).toBeTruthy()
    expect(getByText('Visitors Today')).toBeTruthy()
    expect(getByText('50')).toBeTruthy()
    expect(getByText('Views Today')).toBeTruthy()
    expect(getByText('200')).toBeTruthy()
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

    const { getByText } = renderStatsCard(
      daily_visits,
      monthly_visits,
      yearly_visits
    )

    // For daily visits
    expect(getByText('Entries Today')).toBeTruthy()
    expect(getByText('100')).toBeTruthy()
    expect(getByText('Visitors Today')).toBeTruthy()
    expect(getByText('50')).toBeTruthy()
    expect(getByText('Views Today')).toBeTruthy()
    expect(getByText('200')).toBeTruthy()

    // For monthly visits
    expect(getByText('Entries This Month')).toBeTruthy()
    expect(getByText('1k')).toBeTruthy()
    expect(getByText('Visitors This Month')).toBeTruthy()
    expect(getByText('500')).toBeTruthy()
    expect(getByText('Views This Month')).toBeTruthy()
    expect(getByText('2k')).toBeTruthy()

    // For yearly visits
    expect(getByText('Entries This Year')).toBeTruthy()
    expect(getByText('10k')).toBeTruthy()
    expect(getByText('Visitors This Year')).toBeTruthy()
    expect(getByText('5k')).toBeTruthy()
    expect(getByText('Views This Year')).toBeTruthy()
    expect(getByText('20k')).toBeTruthy()
  })
})
