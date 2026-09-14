'use client'
import { ErrorBoundary } from 'react-error-boundary'

import { HowAProposalWorks } from '@/app/proposals/components/HowAProposalWorks'
import { ProposalsBanner } from '@/app/proposals/components/ProposalsBanner'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'

export default function ProposalsPage() {
  return (
    <div className="flex w-full flex-col gap-2" data-testid="ProposalsPage">
      <ProposalsBanner />
      <HowAProposalWorks />
      <ErrorBoundary fallbackRender={withFallbackRetry(<ProposalsFromChain />)}>
        <ProposalsFromTheGraph />
      </ErrorBoundary>
    </div>
  )
}
