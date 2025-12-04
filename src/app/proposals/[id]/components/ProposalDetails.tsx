import { Paragraph, Span } from '@/components/Typography'
import { TokenImage } from '@/components/TokenImage'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { cn, formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { type Address, formatEther } from 'viem'
import {
  convertAmountToBigint,
  type DecodedFunctionName,
  DISPLAY_NAME_SEPARATOR,
  getDiscourseLinkFromProposalDescription,
  splitCombinedName,
} from '@/app/proposals/shared/utils'
import { type ParsedActionDetails, ProposalType } from '../types'
import type { Moment } from 'moment'

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
  totalActionsCount?: number
}

interface DetailItemProps {
  label: string
  children: React.ReactNode
  show?: boolean
  'data-testid'?: string
}

const DetailItem = ({ label, children, show = true, 'data-testid': dataTestId }: DetailItemProps) => {
  if (!show) return null

  return (
    <div className="!min-w-1/2 max-w-full flex-shrink-0 flex flex-col md:pl-6 pl-4">
      <Span variant="tag-s" className="text-white/70" bold data-testid={dataTestId}>
        {label}
      </Span>
      {children}
    </div>
  )
}

interface DiscourseLinkProps {
  link: string
  readOnly?: boolean
  'data-testid'?: string
}

const DiscourseLink = ({ link, readOnly, 'data-testid': dataTestId }: DiscourseLinkProps) => {
  return (
    <Paragraph
      variant="body"
      className={!readOnly ? 'text-primary' : 'text-wrap break-words whitespace-normal'}
      data-testid={dataTestId}
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

/**
 *  This is being used in both Proposal Details page and Review Proposal page
 *
 * @param name
 * @param description
 * @param proposer
 * @param startsAt
 * @param parsedAction
 * @param actionName
 * @param link
 * @param readOnly
 * @constructor
 */
export const ProposalDetails = ({
  name,
  description,
  proposer,
  startsAt,
  parsedAction,
  actionName,
  link,
  readOnly,
  totalActionsCount = 1,
}: ProposalDetailsProps) => {
  const nameToUse = name.includes(DISPLAY_NAME_SEPARATOR) ? name : (description ?? '').split(';')[0]
  const { builderName } = splitCombinedName(nameToUse)

  const discourseLink =
    link ?? (description ? getDiscourseLinkFromProposalDescription(description) : undefined)
  const addressToWhitelist = parsedAction.builder

  const isCommunityApproveBuilderAction = actionName === 'communityApproveBuilder'
  const isBuilderDeactivationAction = actionName === 'dewhitelistBuilder'

  const getProposalTypeLabel = () => {
    const additionalActionsText =
      totalActionsCount > 1
        ? ` (+${totalActionsCount - 1} more action${totalActionsCount - 1 > 1 ? 's' : ''})`
        : ''

    if (parsedAction.type === ProposalType.WITHDRAW && parsedAction.amount && parsedAction.tokenSymbol) {
      return (
        <>
          Transfer of {formatNumberWithCommas(formatEther(convertAmountToBigint(parsedAction.amount)))}
          <Span className="inline-flex ml-2">
            <TokenImage symbol={parsedAction.tokenSymbol} size={16} />
            <Span className="font-bold ml-1">{parsedAction.tokenSymbol}</Span>
          </Span>
          {additionalActionsText && <Span className="text-white/70 ml-1">{additionalActionsText}</Span>}
        </>
      )
    }

    if (parsedAction.type === ProposalType.BUILDER_ACTIVATION) {
      return `Builder activation${additionalActionsText}`
    }

    if (parsedAction.type === ProposalType.BUILDER_DEACTIVATION) {
      return `Builder deactivation${additionalActionsText}`
    }

    return `${parsedAction.type}${additionalActionsText}`
  }

  return (
    <div className="flex flex-wrap gap-y-6 md:mt-0 mt-8 md:pr-6 pr-4">
      <DetailItem label="Proposal type" data-testid="ProposalTypeLabel">
        <Paragraph variant="body" className="flex items-center flex-shrink-0" data-testid="ProposalType">
          {getProposalTypeLabel()}
        </Paragraph>
      </DetailItem>

      <DetailItem label="Created on" data-testid="CreatedOnLabel">
        <Paragraph variant="body" data-testid="CreatedOn">
          {startsAt ? startsAt.format('DD MMM YYYY') : '—'}
        </Paragraph>
      </DetailItem>

      <DetailItem
        label="Builder name"
        show={isCommunityApproveBuilderAction || isBuilderDeactivationAction}
        data-testid="BuilderNameLabel"
      >
        <Paragraph
          variant="body"
          className={cn('text-sm font-medium', !readOnly && 'text-primary')}
          data-testid="BuilderName"
        >
          {/** TODO: enable later when builder profile feature is implemented */}
          {/* <a href={`/builders/${addressToWhitelist}`} className="hover:underline"> */}
          {builderName}
          {/* </a> */}
        </Paragraph>
      </DetailItem>

      <DetailItem
        label="Builder address"
        show={(isCommunityApproveBuilderAction || isBuilderDeactivationAction) && !!addressToWhitelist}
        data-testid="BuilderAddressLabel"
      >
        {addressToWhitelist ? (
          !readOnly ? (
            <ShortenAndCopy value={addressToWhitelist} data-testid="BuilderAddress" />
          ) : (
            <Span variant="body" data-testid="BuilderAddress">
              {shortAddress(addressToWhitelist as Address)}
            </Span>
          )
        ) : (
          <Span variant="body" data-testid="BuilderAddress">
            —
          </Span>
        )}
      </DetailItem>

      <DetailItem label="Proposed by" data-testid="ProposedByLabel">
        {proposer ? (
          !readOnly ? (
            <ShortenAndCopy value={proposer} data-testid="ProposedBy" className="text-primary" />
          ) : (
            <Span variant="body" data-testid="ProposedBy">
              {shortAddress(proposer as Address)}
            </Span>
          )
        ) : (
          <Span variant="body" data-testid="ProposedBy">
            —
          </Span>
        )}
      </DetailItem>

      <DetailItem label="Community discussion" data-testid="CommunityDiscussionLabel">
        {discourseLink ? (
          <DiscourseLink link={discourseLink} readOnly={readOnly} data-testid="CommunityDiscussion" />
        ) : (
          <Span variant="body" data-testid="CommunityDiscussion">
            —
          </Span>
        )}
      </DetailItem>
    </div>
  )
}
