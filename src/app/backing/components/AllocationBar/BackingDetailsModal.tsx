'use client'

import { formatSymbol } from '@/app/shared/formatter'
import { Circle } from '@/components/Circle'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { AllocationBarSegmentVisual } from './AllocationBarSegmentVisual'
import { AllocationItem } from './types'
import { valueToPercentage } from './utils'
import { isAddress } from 'viem'
import { shortAddress } from '@/lib/utils'

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
          {itemsData.map(item => (
            <AllocationBarSegmentVisual key={item.key} item={item} totalValue={totalBacking} />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {itemsData.map(item => {
            const percent = valueToPercentage(item.value, totalBacking).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })

            return (
              <div key={item.key} className="flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Circle color={item.displayColor} className="w-[10px] h-[10px] min-w-[10px]" />
                    <Label variant="body-s" bold className="truncate">
                      {isAddress(item.label) ? shortAddress(item.label) : item.label}
                    </Label>
                  </div>
                  <Label variant="body-s" bold className="mr-14">
                    {percent}%
                  </Label>
                </div>

                {item.isTemporary && (
                  <div className="flex items-center justify-between gap-4">
                    <Label variant="body-s" className="pl-4">
                      Pending
                    </Label>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <HourglassIcon className="size-4" />
                      <Span>{formatSymbol(item.value, STRIF)}</Span>
                      <TokenImage symbol={STRIF} />
                      <Span variant="body-s"> {STRIF}</Span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Label variant="body-s" className="pl-4">
                    Current backing
                  </Label>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Span>{formatSymbol(item.initialValue ?? 0n, STRIF)}</Span>
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
