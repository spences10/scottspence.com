import { gql, GraphQLClient } from 'graphql-request'

export const contributions = async user => {
  const arrayOfDays = []

  const { weeks } = user.contributionsCollection.contributionCalendar

  for (const { contributionDays } of weeks) {
    const days = contributionDays.map(
      ({ contributionCount, date }) => {
        return {
          day: date,
          value: contributionCount,
        }
      }
    )
    // @ts-ignore
    arrayOfDays.push(days)
  }

  const smoosh = [].concat.apply([], arrayOfDays)

  const contributionsData = smoosh
    .map(({ day, value }) => {
      return { date: new Date(day), value }
      // return `${day.split('-')[0]},${
      //   day.split('-')[1] - 1 // because JavaScript!
      // },${day.split('-')[2]},${value}`
    })
    .slice(0, smoosh.length - 1)

  return contributionsData
}

export async function get() {
  
  const graphCmsClient = new GraphQLClient(
    'https://api.github.com/graphql',
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
      },
    }
  )
  try {
    const query = gql`
      query UserContributions(
        $username: String!
        $yearFrom: DateTime!
        $yearTo: DateTime!
      ) {
        user(login: $username) {
          contributionsCollection(from: $yearFrom, to: $yearTo) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      username: 'spences10',
      yearFrom: `2019-01-01T00:00:00.000Z`,
      yearTo: `2019-12-31T00:00:00.000Z`,
    }

    const { user } = await graphCmsClient.request(query, variables)

    return {
      status: 200,
      body: await contributions(user),
    }
  } catch (error) {
    return {
      status: 500,
      body: error.message,
    }
  }
}
