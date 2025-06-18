import { CommonComponentProps } from '@/components/commonProps'
import CheckboxChecked from '@/components/Icons/CheckboxChecked'
import CheckboxUnchecked from '@/components/Icons/CheckboxUnchecked'
import { TableHeaderCell } from '@/components/TableNew'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { FC } from 'react'

export const SelectorHeaderCell: FC<
  CommonComponentProps & {
    onClick?: () => void
  }
> = ({ className, onClick }) => {
  const { selectedRows } = useTableContext()

  return (
    <TableHeaderCell
      className={cn('flex min-w-10 self-center gap-2', className)}
      onClick={onClick}
      contentClassName="self-center"
    >
      {Object.keys(selectedRows).some(id => selectedRows[id]) ? <CheckboxChecked /> : <CheckboxUnchecked />}
    </TableHeaderCell>
  )
}
