import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import StatsCard from './stats-card.svelte'

describe('StatsCard', () => {
  it('should render stats correctly', () => {
    const stats = {
      visits: 100,
      uniques: 50,
      pageviews: 200,
    }
    const title = 'Stats Title'
    const time_period = 'day'

    const { getByText } = render(StatsCard, {
      props: {
        stats,
        title,
        time_period,
      },
    })

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

    const { getByText } = render(StatsCard, {
      props: {
        stats,
        title,
        time_period,
      },
    })

    expect(getByText('0')).toBeTruthy()
  })
})
