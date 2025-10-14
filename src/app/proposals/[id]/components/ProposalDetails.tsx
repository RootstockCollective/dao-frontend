import { Paragraph, Span } from '@/components/Typography'
import { TokenImage } from '@/components/TokenImage'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { cn, formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { Address, formatEther } from 'viem'
import {
  convertAmountToBigint,
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
  link?: string
  readOnly?: boolean
}

interface DetailItemProps {
  label: string
  children: React.ReactNode
  show?: boolean
}

const DetailItem = ({ label, children, show = true }: DetailItemProps) => {
  if (!show) return null

  return (
    <div className="!min-w-1/2 max-w-full flex-shrink-0 flex flex-col md:pl-6 pl-4">
      <Span variant="tag-s" className="text-white/70" bold>
        {label}
      </Span>
      {children}
    </div>
  )
}

interface DiscourseLinkProps {
  link: string
  readOnly?: boolean
}

const DiscourseLink = ({ link, readOnly }: DiscourseLinkProps) => {
  return (
    <Paragraph
      variant="body"
      className={!readOnly ? 'text-primary' : 'text-wrap break-words whitespace-normal'}
    >
      {!readOnly ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
          See on Discourse
        </a>
      ) : (
        link.split('https://')[1]
      )}
    </Paragraph>
  )
}

export const ProposalDetails = ({
  name,
  description,
  proposer,
  startsAt,
  parsedAction,
  actionName,
  link,
  readOnly,
}: ProposalDetailsProps) => {
  const { builderName } = splitCombinedName(name)
  const discourseLink =
    link ?? (description ? getDiscourseLinkFromProposalDescription(description) : undefined)
  const addressToWhitelist = parsedAction.builder

  const isCommunityApproveBuilderAction = actionName === 'communityApproveBuilder'

  const getProposalTypeLabel = () => {
    if (parsedAction.type === ProposalType.WITHDRAW && parsedAction.amount && parsedAction.tokenSymbol) {
      return (
        <>
          Transfer of {formatNumberWithCommas(formatEther(convertAmountToBigint(parsedAction.amount)))}
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
    <div className="flex flex-wrap gap-y-6 md:mt-0 mt-8 md:pr-6 pr-4">
      <DetailItem label="Proposal type">
        <Paragraph variant="body" className="flex items-center flex-shrink-0">
          {getProposalTypeLabel()}
        </Paragraph>
      </DetailItem>

      <DetailItem label="Created on">
        <Paragraph variant="body">{startsAt ? startsAt.format('DD MMM YYYY') : '—'}</Paragraph>
      </DetailItem>

      <DetailItem label="Builder name" show={isCommunityApproveBuilderAction}>
        <Paragraph variant="body" className={cn('text-sm font-medium', !readOnly && 'text-primary')}>
          {/** TODO: enable later when builder profile feature is implemented */}
          {/* <a href={`/builders/${addressToWhitelist}`} className="hover:underline"> */}
          {builderName}
          {/* </a> */}
        </Paragraph>
      </DetailItem>

      <DetailItem label="Builder address" show={isCommunityApproveBuilderAction && !!addressToWhitelist}>
        {addressToWhitelist ? (
          !readOnly ? (
            <ShortenAndCopy value={addressToWhitelist} />
          ) : (
            <Span variant="body">{shortAddress(addressToWhitelist as Address)}</Span>
          )
        ) : (
          <Span variant="body">—</Span>
        )}
      </DetailItem>

      <DetailItem label="Proposed by">
        {proposer ? (
          !readOnly ? (
            <ShortenAndCopy value={proposer} />
          ) : (
            <Span variant="body">{shortAddress(proposer as Address)}</Span>
          )
        ) : (
          <Span variant="body">—</Span>
        )}
      </DetailItem>

      <DetailItem label="Community discussion">
        {discourseLink ? (
          <DiscourseLink link={discourseLink} readOnly={readOnly} />
        ) : (
          <Span variant="body">—</Span>
        )}
      </DetailItem>
    </div>
  )
}
