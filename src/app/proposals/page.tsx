'use client'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { HowAProposalWorks } from '@/app/proposals/components/HowAProposalWorks'
import { ProposalsBanner } from '@/app/proposals/components/ProposalsBanner'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { ProposalCounts } from '@/app/proposals/shared/types'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'

export default function ProposalsPage() {
  const [chainCounts, setChainCounts] = useState<ProposalCounts | null>(null)

  return (
    <div className="flex w-full flex-col gap-2" data-testid="ProposalsPage">
      <ProposalsBanner fallbackCounts={chainCounts} />
      <HowAProposalWorks />
      <ErrorBoundary
        fallbackRender={withFallbackRetry(<ProposalsFromChain onCountsChange={setChainCounts} />)}
      >
        <ProposalsFromTheGraph />
      </ErrorBoundary>
    </div>
  )
}
