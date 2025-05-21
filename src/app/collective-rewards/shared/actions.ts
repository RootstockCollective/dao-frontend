'use server'

import { Address } from 'viem'
import { ApolloClient, gql as apolloGQL, HttpLink, InMemoryCache } from '@apollo/client'
import axios from 'axios'

type CycleData = {
  id: string
  rewardsERC20: string
  rewardsRBTC: string
}

type BackerRewardPercentageData = {
  id: string
  next: string
  previous: string
  cooldownEndTime: string
}

type BuilderData = {
  id: Address
  backerRewardPercentage: BackerRewardPercentageData
  rewardShares: string
  totalAllocation: string
}

type Response = {
  builders: BuilderData[]
  cycles: CycleData[]
}

type AxiosResponse = {
  data: Response
}

const apolloQuery = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

const query = `
  query AbiMetricsData {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

const graffleQuery = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

const fetchCrTheGraphEndpoint = `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`
console.log('### fetchCrTheGraphEndpoint', fetchCrTheGraphEndpoint)
function makeClient() {
  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: fetchCrTheGraphEndpoint,
    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    fetchOptions: {
      // you can pass additional options that should be passed to `fetch` here,
      // e.g. Next.js-related `fetch` options regarding caching and revalidation
      // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
    },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
  })

  // use the `ApolloClient` from "@apollo/client-integration-nextjs"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/client-integration-nextjs"
    cache: new InMemoryCache(),
    link: httpLink,
  })
}


const client = makeClient()
async function apolloRequest<T>(query: any) {
  return client.query<T>({ query })
}

const instance = axios.create({
  baseURL: fetchCrTheGraphEndpoint
})
async function axiosRequest() {
  const {
    data: { data: abiData },
  } = await instance.post<AxiosResponse>(fetchCrTheGraphEndpoint, {
    query,
  })
  return abiData
}

async function fetchRequest() {
  const body = JSON.stringify({
    query,
  })
  console.log('### body', body)
  const response = await fetch(fetchCrTheGraphEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
  const { data } = await response.json()
  return data
}

export async function fetchABIData() {
  console.time('thegraph')

  // const abiData = await axiosRequest()
  const { data: abiData } = await apolloRequest<Response>(apolloQuery)
  // const abiData = await fetchRequest()
  console.timeEnd('thegraph')

  return abiData
}
