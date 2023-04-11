import { cleanup, render } from '@testing-library/svelte'
import { afterEach, describe, expect, it } from 'vitest'
import StatsCard from './stats-card.svelte'

describe('StatsCard', () => {
  afterEach(cleanup)

  function renderStatsCard(
    stats: { visits: number; uniques: number; pageviews: number },
    title: string,
    time_period: string
  ) {
    return render(StatsCard, {
      props: {
        stats,
        title,
        time_period,
      },
    })
  }

  it('should render stats correctly', () => {
    const stats = {
      visits: 100,
      uniques: 50,
      pageviews: 200,
    }
    const title = 'Stats Title'
    const time_period = 'day'

    const { getByText } = renderStatsCard(stats, title, time_period)

    expect(getByText('Entries Today')).toBeTruthy()
    expect(getByText('100')).toBeTruthy()
    expect(getByText('Visitors Today')).toBeTruthy()
    expect(getByText('50')).toBeTruthy()
    expect(getByText('Views Today')).toBeTruthy()
    expect(getByText('200')).toBeTruthy()
  })

  it('should render 0 for null values', () => {
    const stats = {
      visits: 0,
      uniques: 50,
      pageviews: 200,
    }
    const title = 'Stats Title'
    const time_period = 'day'

    const { getByText } = renderStatsCard(stats, title, time_period)

    expect(getByText('0')).toBeTruthy()
  })

  it('should render stats for different time periods', () => {
    const stats = {
      visits: 1000,
      uniques: 500,
      pageviews: 2000,
    }
    const title = 'Stats Title'

    const time_periods = {
      day: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
    }

    Object.entries(time_periods).forEach(([time_period, label]) => {
      const { getByText } = renderStatsCard(stats, title, time_period)

      expect(getByText(`Entries ${label}`)).toBeTruthy()
      expect(getByText(`Visitors ${label}`)).toBeTruthy()
      expect(getByText(`Views ${label}`)).toBeTruthy()
    })
  })
})
