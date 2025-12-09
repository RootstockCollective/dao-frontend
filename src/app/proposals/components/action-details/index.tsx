import type { ReactNode } from 'react'
import { Header, Paragraph, Span } from '@/components/Typography'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { TokenImage } from '@/components/TokenImage'
import Big from '@/lib/big'
import { formatNumberWithCommas, formatCurrency, cn, shortAddress } from '@/lib/utils'
import { type Address, formatEther } from 'viem'
import { type ParsedActionDetails, ProposalType } from '../../[id]/types'
import type { ClassNameValue } from 'tailwind-merge'
import { convertAmountToBigint } from '../../shared/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface InfoGridItem {
  label: string
  value: ReactNode
}

interface ActionDetailsProps {
  parsedActions: ParsedActionDetails[]
  className?: ClassNameValue
  readOnly?: boolean
}

function InfoGrid({ items }: { items: InfoGridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4">
      {/* Labels row */}
      {items.map(({ label }) => (
        <div key={label}>
          <Paragraph variant="body-s" className="text-white/70 mt-0.5">
            {label}
          </Paragraph>
        </div>
      ))}
      {/* Values row */}
      {items.map(({ label, value }) => (
        <Paragraph variant="body" key={label + '-value'}>
          {value}
        </Paragraph>
      ))}
    </div>
  )
}

const makeRightLabel = (proposalType: ProposalType, isDesktop: boolean) => {
  if (proposalType === ProposalType.BUILDER_ACTIVATION) {
    return isDesktop ? 'Address to whitelist' : 'Of address'
  }
  if (proposalType === ProposalType.BUILDER_DEACTIVATION) {
    return isDesktop ? 'Address to de-whitelist' : 'To de-whitelist'
  }
  return ''
}

// Render content for a single action
const renderSingleActionContent = (
  parsedAction: ParsedActionDetails,
  isDesktop: boolean,
  readOnly?: boolean,
): ReactNode => {
  switch (parsedAction.type) {
    case ProposalType.RAW_TRANSFER:
    case ProposalType.WITHDRAW: {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Span variant="tag-s" className="text-white/70" data-testid="TypeLabel">
              Type
            </Span>
            <Paragraph variant="body" data-testid="Type">
              {parsedAction.type}
            </Paragraph>
          </div>
          <div className="flex flex-col">
            <Span variant="tag-s" className="text-white/70" data-testid="ToAddressLabel">
              To address
            </Span>
            {parsedAction.toAddress ? (
              !readOnly ? (
                <Span className="text-primary">
                  <ShortenAndCopy value={parsedAction.toAddress} data-testid="ToAddress" />
                </Span>
              ) : (
                <Span variant="body" data-testid="ToAddress">
                  {shortAddress(parsedAction.toAddress as Address)}
                </Span>
              )
            ) : (
              <Span variant="body" data-testid="ToAddress">
                —
              </Span>
            )}
          </div>

          <div>
            <Span variant="tag-s" className="text-white/70" data-testid="AmountLabel">
              Amount
            </Span>
            <div className="grid grid-cols-2 gap-x-2 w-max">
              {/* Left column: values, right-aligned */}
              <div className="flex flex-col items-end text-right">
                <Span className="text-[18px] font-bold" data-testid="Amount">
                  {formatNumberWithCommas(formatEther(convertAmountToBigint(parsedAction.amount)))}
                </Span>
                {parsedAction.price !== undefined && (
                  <Span
                    className="text-xs text-white/50 font-normal leading-none"
                    data-testid="AmountCurrency"
                  >
                    {formatCurrency(
                      Big(formatEther(convertAmountToBigint(parsedAction.amount)))
                        .times(parsedAction.price)
                        .toNumber(),
                    )}
                  </Span>
                )}
              </div>
              {/* Right column: symbols, left-aligned */}
              <div className="flex flex-col items-start">
                {parsedAction.tokenSymbol && (
                  <div className="flex items-center">
                    <TokenImage symbol={parsedAction.tokenSymbol} />
                    <Span className="ml-1" data-testid="AmountTokenSymbol">
                      {parsedAction.tokenSymbol}
                    </Span>
                  </div>
                )}
                {/* TODO: make sure USD is perfectly aligned with its value */}
                <Span className="font-normal text-xs text-white/50" data-testid="AmountCurrencySymbol">
                  USD
                </Span>
              </div>
            </div>
          </div>
          {parsedAction.rns ? (
            <div>
              <Span variant="tag-s" className="text-white/70" data-testid="TypeLabel">
                to RNS
              </Span>
              <Paragraph variant="body" data-testid="Type">
                {parsedAction.rns}
              </Paragraph>
            </div>
          ) : null}
        </div>
      )
    }
    case ProposalType.BUILDER_ACTIVATION:
    case ProposalType.BUILDER_DEACTIVATION: {
      const rightLabel = makeRightLabel(parsedAction.type, isDesktop)
      const items: InfoGridItem[] = [
        { label: 'Type', value: parsedAction.type },
        {
          label: rightLabel,
          value: parsedAction.builder ? (
            !readOnly ? (
              <Span className="text-primary">
                <ShortenAndCopy value={parsedAction.builder} />
              </Span>
            ) : (
              <Span variant="body">{shortAddress(parsedAction.builder as Address) || '—'}</Span>
            )
          ) : (
            <Span variant="body">—</Span>
          ),
        },
      ]
      return <InfoGrid items={items} />
    }
    case ProposalType.UNKNOWN:
    default:
      return (
        <Paragraph className="mt-2 text-text-secondary" variant="body-s">
          Action details not supported for this proposal type
        </Paragraph>
      )
  }
}

export const ActionDetails = ({ parsedActions, className, readOnly }: ActionDetailsProps) => {
  const isDesktop = useIsDesktop()
  const totalCount = parsedActions.length

  // For single transaction - render as before (backward compatibility)
  if (totalCount === 1) {
    const content = renderSingleActionContent(parsedActions[0], isDesktop, readOnly)
    return (
      <div
        className={cn(
          'md:p-6 px-4 py-8 bg-bg-80 flex flex-col gap-4 md:w-[376px] md:max-h-[214px] md:mt-2 rounded-sm md:self-start',
          className,
        )}
      >
        <Header variant="h3">ACTIONS</Header>
        {content}
      </div>
    )
  }

  // For multiple transactions - render list with separators
  return (
    <div
      className={cn(
        'md:p-6 px-4 py-8 bg-bg-80 flex flex-col gap-4 md:w-[376px] md:mt-2 rounded-sm md:self-start',
        className,
      )}
    >
      <Header variant="h3">ACTIONS ({totalCount})</Header>
      <div className="flex flex-col gap-4">
        {parsedActions.map((action, index) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: index is stable here, array is not reordered
            <div key={`action-${index}`}>
              {index > 0 && <div className="border-t border-white/10 my-4" />}
              <Span variant="tag-s" className="text-white/70 mb-2">
                Action {index + 1}
              </Span>
              {renderSingleActionContent(action, isDesktop, readOnly)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
