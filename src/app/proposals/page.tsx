'use client'
import { useState } from 'react'
import { ProposalsGraphQL } from '@/app/proposals/ProposalsGraphQL'
import { Proposals } from './Proposals'

export default function ProposalsPage() {
  const [useGraphQL, setUseGraphQL] = useState(true)
  const [graphQLError, setGraphQLError] = useState(false)

  return useGraphQL ? (
    <ProposalsGraphQL
      onError={() => {
        setGraphQLError(true)
        setUseGraphQL(false)
      }}
    />
  ) : (
    <Proposals />
  )
}
