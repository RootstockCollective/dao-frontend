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
  Starts: Moment
  fullProposalName?: string
  parsedAction: ParsedActionDetails
  actionName: DecodedFunctionName | undefined
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

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-10">
      <div>
        <Span variant="tag-s" className="text-white/70" bold>
          Proposal type
        </Span>
        <Paragraph variant="body" className="flex items-center">
          {/* For transfer actions, show amount, token image, and symbol. For others, show a label. */}
          {parsedAction.type === ProposalType.WITHDRAW && parsedAction.amount && parsedAction.tokenSymbol ? (
            <>
              Transfer of {formatNumberWithCommas(formatEther(parsedAction.amount))}
              <Span className="inline-flex ml-2">
                <TokenImage symbol={parsedAction.tokenSymbol} size={16} />
                <Span className="font-bold ml-1">{parsedAction.tokenSymbol}</Span>
              </Span>
            </>
          ) : parsedAction.type === ProposalType.BUILDER_ACTIVATION ? (
            <>Builder activation</>
          ) : parsedAction.type === ProposalType.BUILDER_DEACTIVATION ? (
            <>Builder deactivation</>
          ) : (
            <>{parsedAction.type}</>
          )}
        </Paragraph>
      </div>
      <div>
        <Span variant="tag-s" className="text-white/70" bold>
          Created on
        </Span>
        <Paragraph variant="body">{Starts ? Starts.format('DD MMM YYYY') : '—'}</Paragraph>
      </div>
      <div>
        {isCommunityApproveBuilderAction ? (
          <Span variant="tag-s" className="text-white/70" bold>
            Builder name
          </Span>
        ) : null}
        <Paragraph variant="body" className="text-sm font-medium text-primary">
          {/** TODO: enable later when builder profile feature is implemented */}
          {/* <a href={`/builders/${addressToWhitelist}`} className="hover:underline"> */}
          {builderName}
          {/* </a> */}
        </Paragraph>
      </div>
      <div>
        {isCommunityApproveBuilderAction ? (
          <Span variant="tag-s" className="text-white/70" bold>
            Builder address
          </Span>
        ) : null}
        {addressToWhitelist && isCommunityApproveBuilderAction ? (
          <ShortenAndCopy value={addressToWhitelist} />
        ) : null}
      </div>
      <div>
        <Span variant="tag-s" className="text-white/70" bold>
          Proposed by
        </Span>
        {proposer ? <ShortenAndCopy value={proposer} /> : <Span variant="body">—</Span>}
      </div>
      <div>
        <Span variant="tag-s" className="text-white/70" bold>
          Community discussion
        </Span>
        {discourseLink ? (
          <Paragraph variant="body" className="text-sm font-medium text-primary">
            <a href={discourseLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              See on Discourse
            </a>
          </Paragraph>
        ) : (
          ' - '
        )}
      </div>
    </div>
  )
}
