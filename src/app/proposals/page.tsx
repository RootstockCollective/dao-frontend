'use client'
import { ErrorBoundary } from 'react-error-boundary'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { HeroComponent } from '@/components/HeroComponent'
import { Button } from '@/components/ButtonNew'
import { useRouter } from 'next/navigation'

export default function ProposalsPage() {
  const { push } = useRouter()

  return (
    <>
      <HeroComponent
        imageSrc="/images/hero/proposals-banner.png"
        title="Propose a Project,"
        subtitle="Get support to build it"
        items={[
          "Clarify your project's purpose on Discourse",
          'Submit a proposal to suggest a change or fund a project',
          'The community will view and discuss it',
          'The community will use their stRIF or delegated power to vote',
          'If your proposal passes quorum, it will be approved',
          'Complete your KYC to ensure eligibility (apply for Grants)',
        ]}
        button={<Button onClick={() => push('/proposals/new')}>Create a proposal</Button>}
      />
      <ErrorBoundary fallbackRender={withFallbackRetry(<ProposalsFromChain />)}>
        <ProposalsFromTheGraph />
      </ErrorBoundary>
    </>
  )
}
