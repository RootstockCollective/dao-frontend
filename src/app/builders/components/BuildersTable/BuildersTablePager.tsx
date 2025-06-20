import { TablePager } from '@/components/TableNew/TablePager'
import { FC } from 'react'

interface BuildersTablePagerProps {
  pageSize: number
  totalItems: number
  onPageChange: (startIndex: number, endIndex: number) => void
}

export const BuildersTablePager: FC<BuildersTablePagerProps> = ({ pageSize, totalItems, onPageChange }) => {
  return (
    <TablePager
      pageSize={pageSize}
      totalItems={totalItems}
      pagedItemName="Builders"
      onPageChange={onPageChange}
      mode="expandable"
    />
  )
}
