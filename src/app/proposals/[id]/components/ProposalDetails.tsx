import { Paragraph, Span } from '@/components/Typography'
import { TokenImage } from '@/components/TokenImage'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { formatNumberWithCommas } from '@/lib/utils'
import { formatEther } from 'viem'
import {
  DecodedFunctionName,
  getDiscourseLinkFromProposalDescription,
  splitCombinedName,
} from '@/app/proposals/shared/utils'
import { ParsedActionDetails, ProposalType } from '../types'
import { Moment } from 'moment'

interface ProposalDetailsProps {
  name: string
  description: string | null
  proposer: string
  startsAt: Moment
  fullProposalName?: string
  parsedAction: ParsedActionDetails
  actionName: DecodedFunctionName | undefined
}

interface DetailItemProps {
  label: string
  children: React.ReactNode
  show?: boolean
}

const DetailItem = ({ label, children, show = true }: DetailItemProps) => {
  if (!show) return null

  return (
    <div>
      <Span variant="tag-s" className="text-white/70" bold>
        {label}
      </Span>
      {children}
    </div>
  )
}

export const ProposalDetails = ({
  name,
  description,
  proposer,
  Starts,
  parsedAction,
  actionName,
}: ProposalDetailsProps) => {
  const { builderName } = splitCombinedName(name)
  const discourseLink = description ? getDiscourseLinkFromProposalDescription(description) : undefined
  const addressToWhitelist = parsedAction.builder

  const isCommunityApproveBuilderAction = actionName === 'communityApproveBuilder'

  const getProposalTypeLabel = () => {
    if (parsedAction.type === ProposalType.WITHDRAW && parsedAction.amount && parsedAction.tokenSymbol) {
      return (
        <>
          Transfer of {formatNumberWithCommas(formatEther(parsedAction.amount))}
          <Span className="inline-flex ml-2">
            <TokenImage symbol={parsedAction.tokenSymbol} size={16} />
            <Span className="font-bold ml-1">{parsedAction.tokenSymbol}</Span>
          </Span>
        </>
      )
    }

    if (parsedAction.type === ProposalType.BUILDER_ACTIVATION) {
      return 'Builder activation'
    }

    if (parsedAction.type === ProposalType.BUILDER_DEACTIVATION) {
      return 'Builder deactivation'
    }

    return parsedAction.type
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-10">
      <DetailItem label="Proposal type">
        <Paragraph variant="body" className="flex items-center">
          {getProposalTypeLabel()}
        </Paragraph>
      </DetailItem>

      <DetailItem label="Created on">
        <Paragraph variant="body">{startsAt ? startsAt.format('DD MMM YYYY') : '—'}</Paragraph>
      </DetailItem>

      <DetailItem label="Builder name" show={isCommunityApproveBuilderAction}>
        <Span variant="tag-s" className="text-white/70" bold>
          Builder name
        </Span>
        <Paragraph variant="body" className="text-sm font-medium text-primary">
          {/** TODO: enable later when builder profile feature is implemented */}
          {/* <a href={`/builders/${addressToWhitelist}`} className="hover:underline"> */}
          {builderName}
          {/* </a> */}
        </Paragraph>
      </DetailItem>

      <DetailItem label="Builder address" show={isCommunityApproveBuilderAction && !!addressToWhitelist}>
        <ShortenAndCopy value={addressToWhitelist!} />
      </DetailItem>

      <DetailItem label="Proposed by">
        {proposer ? <ShortenAndCopy value={proposer} /> : <Span variant="body">—</Span>}
      </DetailItem>

      <DetailItem label="Community discussion">
        {discourseLink ? (
          <Paragraph variant="body" className="text-sm font-medium text-primary">
            <a href={discourseLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              See on Discourse
            </a>
          </Paragraph>
        ) : (
          <Span variant="body">—</Span>
        )}
      </DetailItem>
    </div>
  )
}
