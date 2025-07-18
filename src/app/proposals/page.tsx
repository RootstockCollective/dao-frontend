'use client'
import { HeaderTitle } from '@/components/Typography'
import { ErrorBoundary } from 'react-error-boundary'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { ProposalStep, useProposalStepper } from './components/stepper/StepperProvider'
import { useEffect } from 'react'

export default function ProposalsPage() {
  const { setCurrentStep } = useProposalStepper()
  useEffect(() => {
    setCurrentStep(ProposalStep.None)
    // eslint-disable-next-line
  }, [])
  return (
    <>
      <HeaderTitle className="pb-6 whitespace-nowrap">My Governance</HeaderTitle>
      <ErrorBoundary fallbackRender={withFallbackRetry(<ProposalsFromChain />)}>
        <ProposalsFromTheGraph />
      </ErrorBoundary>
    </>
  )
}
