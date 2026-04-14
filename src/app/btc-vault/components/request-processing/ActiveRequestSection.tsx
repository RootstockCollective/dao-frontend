'use client'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { RequestProcessingBlock } from './RequestProcessingBlock'
import type { ActiveRequestDisplay } from '../../services/ui/types'

interface ActiveRequestSectionProps {
  data: ActiveRequestDisplay[] | undefined
}

export function ActiveRequestSection({ data }: ActiveRequestSectionProps) {
  if (!data?.length) return null

  return (
    <section data-testid="btc-vault-active-request" className="w-full">
      <SectionContainer title="REQUEST PROCESSING" headerVariant="h3">
        <RequestProcessingBlock request={data[0]} />
      </SectionContainer>
    </section>
  )
}
