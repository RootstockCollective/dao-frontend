import type { ReactNode } from 'react'
import { Header, Paragraph, Span } from '@/components/Typography'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { TokenImage } from '@/components/TokenImage'
import Big from '@/lib/big'
import { formatNumberWithCommas, formatCurrency, cn, shortAddress } from '@/lib/utils'
import { Address, formatEther } from 'viem'
import { ActionType, ProposalType } from '../../[id]/types'
import { ClassNameValue } from 'tailwind-merge'
import { convertAmountToBigint } from '../../shared/utils'

interface InfoGridItem {
  label: string
  value: ReactNode
}

interface ActionDetailsProps {
  parsedAction: {
    type: string
    amount?: bigint | string
    tokenSymbol?: string
    price?: number
    toAddress?: string
    builder?: string
  }
  actionType: ActionType
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

export const ActionDetails = ({ parsedAction, actionType, className, readOnly }: ActionDetailsProps) => {
  let content: ReactNode = null

  switch (parsedAction.type) {
    case ProposalType.WITHDRAW: {
      content = (
        <>
          <div className="grid grid-cols-2">
            <div>
              <Span variant="tag-s" className="text-white/70">
                Type
              </Span>
              <Paragraph variant="body">{actionType}</Paragraph>
            </div>
            <div className="flex flex-col">
              <Span variant="tag-s" className="text-white/70">
                To address
              </Span>
              {parsedAction.toAddress ? (
                !readOnly ? (
                  <Span className="text-primary">
                    <ShortenAndCopy value={parsedAction.toAddress} />
                  </Span>
                ) : (
                  <Span variant="body">{shortAddress(parsedAction.toAddress as Address)}</Span>
                )
              ) : (
                <Span variant="body">—</Span>
              )}
            </div>
          </div>
          {/* Amount block full width */}
          <div>
            <Span variant="tag-s" className="text-white/70">
              Amount
            </Span>
            <div className="grid grid-cols-2 gap-x-2 w-max">
              {/* Left column: values, right-aligned */}
              <div className="flex flex-col items-end text-right">
                <Span className="text-[18px] font-bold">
                  {formatNumberWithCommas(formatEther(convertAmountToBigint(parsedAction.amount)))}
                </Span>
                {parsedAction.price !== undefined && (
                  <Span className="text-xs text-white/50 font-normal leading-none">
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
                    <Span className="ml-1">{parsedAction.tokenSymbol}</Span>
                  </div>
                )}
                {/* TODO: make sure USD is perfectly aligned with its value */}
                <Span className="font-normal text-xs text-white/50">USD</Span>
              </div>
            </div>
          </div>
        </>
      )
      break
    }
    case ProposalType.BUILDER_ACTIVATION:
    case ProposalType.BUILDER_DEACTIVATION: {
      const rightLabel =
        parsedAction.type === ProposalType.BUILDER_ACTIVATION ? 'Address to whitelist' : 'Builder address'
      const items: InfoGridItem[] = [
        { label: 'Type', value: actionType },
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
      content = <InfoGrid items={items} />
      break
    }
    default:
      content = <Span>Action details not supported for this proposal type</Span>
  }

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
