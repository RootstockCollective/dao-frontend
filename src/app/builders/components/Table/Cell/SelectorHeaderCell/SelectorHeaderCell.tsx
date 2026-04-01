import { CommonComponentProps } from '@/components/commonProps'
import { CheckboxChecked } from '@/components/Icons/CheckboxChecked'
import { CheckboxUnchecked } from '@/components/Icons/CheckboxUnchecked'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { FC } from 'react'
import { BuilderCellDataMap, ColumnId } from '../../BuilderTable.config'

export const SelectorHeaderCell: FC<
  CommonComponentProps & {
    onClick?: () => void
  }
> = ({ className, onClick }) => {
  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()

  return (
    <div className={cn('flex min-w-10 self-center gap-2', className)} onClick={onClick}>
      {Object.keys(selectedRows).some(id => selectedRows[id]) ? <CheckboxChecked /> : <CheckboxUnchecked />}
    </div>
  )
}
