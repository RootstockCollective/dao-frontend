import { Paragraph, Span } from '@/components/Typography'
import { ExternalLink } from '@/components/Link'
import InfoIcon from '../../review/components/InfoIcon'

interface ProposalInfoSidebarProps {
  kycLink: string
}

export const ProposalInfoSidebar = ({ kycLink }: ProposalInfoSidebarProps) => {
  return (
    <div className="flex flex-row gap-2">
      <InfoIcon className="w-5 h-5 text-bg-0" />
      <div className="flex flex-col gap-2">
        <Paragraph className="text-bg-0">
          Before you submit a proposal, make sure that you have{' '}
          <ExternalLink href={kycLink} className="text-v3-primary" target="_blank" rel="noopener noreferrer">
            <Span>completed your KYC</Span>
          </ExternalLink>{' '}
          and that you have submitted and discussed your proposal on{' '}
          <ExternalLink
            href="https://gov.rootstockcollective.xyz/"
            className="text-v3-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Span>Discourse</Span>
          </ExternalLink>
          .
        </Paragraph>
        <Paragraph className="text-bg-0">
          Builders who skip these steps often receive overwhelmingly negative votes.
        </Paragraph>
      </div>
    </div>
  )
}
