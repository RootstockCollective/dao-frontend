import type { ReactNode } from 'react'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { TokenImage } from '@/components/TokenImage'
import Big from '@/lib/big'
import { formatNumberWithCommas, formatCurrency } from '@/lib/utils'
import { formatEther } from 'viem'
import { ProposalType } from '../../create/CreateProposalHeaderSection'

export interface InfoGridItem {
  label: string
  value: ReactNode
}

export interface ActionDetailsProps {
  parsedAction: {
    type: string
    amount?: bigint
    tokenSymbol?: string
    price?: number
    toAddress?: string
    builder?: string
  }
  actionType: string
}

function InfoGrid({ items }: { items: InfoGridItem[] }) {
  return (
    <div className="grid grid-cols-2 text-sm max-w-[376px]">
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
          <div className="grid grid-cols-2 text-sm max-w-[376px] mt-4">
            <div>
              <Paragraph variant="body-s" className="text-white/70 mt-0.5">
                Type
              </Paragraph>
              <Paragraph variant="body">{actionType}</Paragraph>
            </div>
            <div>
              <Paragraph variant="body-s" className="text-white/70 mt-0.5">
                To address
              </Paragraph>
              {parsedAction.toAddress ? (
                <span className="text-primary">
                  <ShortenAndCopy value={parsedAction.toAddress} />
                </span>
              ) : (
                <Span variant="body">—</Span>
              )}
            </div>
          </div>
          {/* Amount block full width */}
          <div>
            <Paragraph variant="body-s" className="text-white/70 mt-0.5">
              Amount
            </Paragraph>
            <div className="flex items-center gap-2 text-[18px] font-bold">
              <Span>{formatNumberWithCommas(formatEther(parsedAction.amount || 0n))}</Span>
              {parsedAction.tokenSymbol && (
                <>
                  <TokenImage symbol={parsedAction.tokenSymbol} />
                  <Span>{parsedAction.tokenSymbol}</Span>
                </>
              )}
            </div>
            <Paragraph variant="body-s" className="text-white/50 mt-1">
              {parsedAction.price !== undefined
                ? formatCurrency(
                    Big(formatEther(parsedAction.amount || 0n))
                      .times(parsedAction.price)
                      .toNumber(),
                  ) + ' USD'
                : ''}
            </Paragraph>
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
            <span className="text-primary">
              <ShortenAndCopy value={parsedAction.builder} />
            </span>
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
    <div className="p-6 bg-bg-80 flex flex-col gap-4 max-w-[376px] mt-2">
      <Header variant="h3">ACTIONS</Header>
      {content}
    </div>
  )
}
