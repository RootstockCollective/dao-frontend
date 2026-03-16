import { HttpLink } from '@apollo/client/link/http'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'

import {
  fetchBtcVaultTheGraphEndpoint,
  fetchCrTheGraphEndpoint,
  fetchDaoTheGraphEndpoint,
} from '@/lib/the-graph'

function makeClient(uri: string) {
  const httpLink = new HttpLink({ uri })

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  })
}

export const client = makeClient(fetchCrTheGraphEndpoint)
export const daoClient = makeClient(fetchDaoTheGraphEndpoint)
export const btcVaultClient = makeClient(fetchBtcVaultTheGraphEndpoint)
