import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { TokenSymbol } from '@/lib/tokens'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import type { ReactNode } from 'react'
import { Address, formatEther } from 'viem'
import { ProposalType } from '../../[id]/types'

interface InfoGridItem {
  label: string
  value: ReactNode
}

interface ActionDetailsProps {
  parsedAction: {
    type: string
    amount?: bigint
    tokenSymbol?: TokenSymbol
    price?: number
    toAddress?: Address
    builder?: Address
  }
  actionType: string
}

function InfoGrid({ items }: { items: InfoGridItem[] }) {
  return (
    <div className="grid grid-cols-2">
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
        <div key={label + '-value'}>{value}</div>
      ))}
    </div>
  )
}

export const ActionDetails = ({ parsedAction, actionType }: ActionDetailsProps) => {
  let content: ReactNode = null

  switch (parsedAction.type) {
    case ProposalType.WITHDRAW: {
      content = (
        <>
          <div className="grid grid-cols-2 mt-4">
            <div>
              <Span variant="tag-s" className="text-white/70 mt-0.5">
                Type
              </Span>
              <Paragraph variant="body">{actionType}</Paragraph>
            </div>
            <div>
              <Span variant="tag-s" className="text-white/70 mt-0.5">
                To address
              </Span>
              {parsedAction.toAddress ? (
                <Span className="text-primary">
                  <ShortenAndCopy value={parsedAction.toAddress} />
                </Span>
              ) : (
                <Span variant="body">—</Span>
              )}
            </div>
          </div>
          {/* Amount block full width */}
          <div>
            <Span variant="tag-s" className="text-white/70 mt-0.5">
              Amount
            </Span>
            <div className="grid grid-cols-2 gap-x-2 w-max">
              {/* Left column: values, right-aligned */}
              <div className="flex flex-col items-end text-right">
                <Span className="text-[18px] font-bold">
                  {formatNumberWithCommas(formatEther(parsedAction.amount || 0n))}
                </Span>
                {parsedAction.price !== undefined && (
                  <Span className="text-xs text-white/50 font-normal leading-none">
                    {formatCurrency(
                      Big(formatEther(parsedAction.amount || 0n))
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
            <Span className="text-primary">
              <ShortenAndCopy value={parsedAction.builder} />
            </Span>
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
    <div className="p-6 bg-bg-80 flex flex-col gap-4 md:max-w-[376px] md:mt-2">
      <Header variant="h3">ACTIONS</Header>
      {content}
    </div>
  )
}
