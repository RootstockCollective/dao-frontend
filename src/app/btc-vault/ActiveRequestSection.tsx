'use client'

import { useAccount } from 'wagmi'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { RequestProcessingBlock } from './components/RequestProcessingBlock'
import { useActiveRequests } from './hooks/useActiveRequests'

export function ActiveRequestSection() {
  const { address } = useAccount()
  const { data } = useActiveRequests(address)

  if (!address || !data?.length) return null

  return (
    <section data-testid="btc-vault-active-request" className="w-full">
      <SectionContainer title="REQUEST PROCESSING" headerVariant="h3">
        <RequestProcessingBlock request={data[0]} />
      </SectionContainer>
    </section>
  )
}
