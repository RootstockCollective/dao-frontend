import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'
import { withTableContext, useTableContext, useTableActionsContext } from '@/shared/context'
import { ReactElement } from 'react'
import { BackerRewardsTable } from './BackerRewardsTable'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'
import { MobileSortModal } from './MobileSortModal'
import { useModal } from '@/shared/hooks/useModal'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FilterIcon } from '@/components/Icons'
import { SortDirection } from '@/shared/context/TableContext/types'

const TableHeader = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const isDesktop = useIsDesktop()
  const { sort, defaultSort } = useTableContext<ColumnId, BackerRewardsCellDataMap>()

  const hasSortChanges = sort.columnId !== defaultSort.columnId || sort.direction !== defaultSort.direction

  return (
    <div className="flex items-center justify-between md:px-0 w-full">
      <Header variant="h4" className="text-nowrap">
        REWARDS DETAILS
      </Header>
      {!isDesktop && (
        <FilterIcon className="w-6 h-6 cursor-pointer" onClick={onOpenModal} highlighted={hasSortChanges} />
      )}
    </div>
  )
}

const BackerRewardsTableContainer = (): ReactElement => {
  const { isModalOpened: isSortModalOpen, openModal: openSortModal, closeModal } = useModal()

  const { sort, defaultSort } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const handleApplySort = (sortColumn: ColumnId | null, sortDirection: SortDirection | null) => {
    const column = sortColumn ?? defaultSort.columnId
    const direction = sortDirection ?? defaultSort.direction
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: column, direction } })
    closeModal()
  }

  const handleResetSort = () => {
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: defaultSort.columnId, direction: defaultSort.direction },
    })
    closeModal()
  }

  return (
    <ActionsContainer title={<TableHeader onOpenModal={openSortModal} />} className="bg-v3-bg-accent-80 p-0">
      <BackerRewardsTable />

      <MobileSortModal
        isOpen={isSortModalOpen}
        currentSort={sort.columnId}
        currentSortDirection={sort.direction}
        onClose={closeModal}
        onApply={handleApplySort}
        onReset={handleResetSort}
      />
    </ActionsContainer>
  )
}

export default withTableContext<ColumnId, BackerRewardsCellDataMap>(BackerRewardsTableContainer)
