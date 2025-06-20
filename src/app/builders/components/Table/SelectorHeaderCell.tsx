import { CommonComponentProps } from '@/components/commonProps'
import CheckboxChecked from '@/components/Icons/CheckboxChecked'
import CheckboxUnchecked from '@/components/Icons/CheckboxUnchecked'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export const SelectorHeaderCell: FC<
  CommonComponentProps & {
    hasSelections: boolean
    onClick?: () => void
  }
> = ({ hasSelections, className, onClick }) => {
  return (
    <div className={cn('flex justify-center items-center', className)} onClick={onClick}>
      {hasSelections ? <CheckboxChecked /> : <CheckboxUnchecked />}
    </div>
  )
}
