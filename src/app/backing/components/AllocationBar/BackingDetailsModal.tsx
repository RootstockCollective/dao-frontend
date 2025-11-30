'use client'

import { formatSymbol } from '@/app/shared/formatter'
import { Circle } from '@/components/Circle'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { AllocationItem } from './types'
import { valueToPercentage } from './utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  itemsData: AllocationItem[]
  totalBacking: bigint
}

/**
 * BackingDetailsModal
 *
 * Modal showing a visual and list breakdown of all backing allocations.
 * Includes bar, color, percent, and item amounts.
 */
export const BackingDetailsModal = ({ isOpen, onClose, itemsData, totalBacking }: Props) => {
  if (!isOpen) return null

  return (
    <Modal onClose={onClose} data-testid="backing-details-modal">
      <div className="p-4 flex flex-col gap-8 mt-10">
        <Header variant="h4" caps>
          Backing Details
        </Header>

        {/* Visual allocation bar */}
        <div className="flex items-center w-full h-20 rounded overflow-hidden">
          {itemsData.map(item => {
            const percentageWidth = valueToPercentage(item.value, totalBacking)
            const effectiveWidth = item.value > 0n && percentageWidth < 0.5 ? 0.5 : percentageWidth

            return (
              <div
                key={item.key}
                className="h-full first:rounded-l-sm last:rounded-r-sm"
                style={{
                  width: `${effectiveWidth}%`,
                  backgroundColor: item.displayColor,
                }}
              />
            )
          })}
        </div>

        <div className="flex flex-col gap-4">
          {itemsData.map(item => {
            const percent = valueToPercentage(item.value, totalBacking).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })

            return (
              <div key={item.key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Circle color={item.displayColor} className="w-[10px] h-[10px] min-w-[10px]" />
                    <Label variant="body-s" bold className="truncate">
                      {item.label}
                    </Label>
                  </div>
                  <Label variant="body-s" bold>
                    {percent}%
                  </Label>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label variant="body-s" className="pl-4">
                    Current backing
                  </Label>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Span>{formatSymbol(item.value, STRIF)}</Span>
                    <TokenImage symbol={STRIF} />
                    <Span variant="body-s"> {STRIF}</Span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
