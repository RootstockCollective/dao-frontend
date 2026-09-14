'use client'

import { useAccount } from 'wagmi'

import { useProposalsContext } from '@/app/proposals/context'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Header, Paragraph, Span } from '@/components/Typography'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

import { CreateProposalFlow } from '../CreateProposalFlow'
import { DiscourseLink } from '../DiscourseLink'

const BANNER_IMAGE_SRC = '/images/proposals-banner-bg.webp'
const EMPTY_VALUE = '-'

const BannerMetric = ({ title, children }: CommonComponentProps & { title: string }) => (
  <div className="flex flex-col gap-0.5">
    <Span variant="body-s" className="text-v3-text-60">
      {title}
    </Span>
    {children}
  </div>
)

export const ProposalsBanner = ({ className }: CommonComponentProps) => {
  const { isConnected } = useAccount()
  const { activeProposalCount, totalProposalCount, loading, error } = useProposalsContext()

  const hasCounts = !loading && !error

  return (
    <PageBanner
      dataTestId="ProposalsBanner"
      dismissible
      imageSrc={BANNER_IMAGE_SRC}
      title="Proposals"
      description={
        <Paragraph>
          Propose a project and get the Collective&apos;s support to build it. Clarify your purpose on
          Discourse, then submit for a community vote.
        </Paragraph>
      }
      bottomRight={<DiscourseLink>Discuss on Discourse</DiscourseLink>}
      className={className}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
        <CreateProposalFlow />
        <div className="flex items-start gap-10">
          <BannerMetric title="Active">
            {isConnected ? (
              <Header variant="h2" data-testid="ActiveProposalsCount">
                {hasCounts ? activeProposalCount : EMPTY_VALUE}
              </Header>
            ) : (
              <div className="flex items-center gap-3">
                <Header variant="h2">{EMPTY_VALUE}</Header>
                <ConnectWorkflow ConnectComponent={ConnectButtonComponent} />
              </div>
            )}
          </BannerMetric>
          <BannerMetric title="Total">
            <Header variant="h2" data-testid="TotalProposalsCount">
              {hasCounts ? totalProposalCount : EMPTY_VALUE}
            </Header>
          </BannerMetric>
        </div>
      </div>
    </PageBanner>
  )
}
