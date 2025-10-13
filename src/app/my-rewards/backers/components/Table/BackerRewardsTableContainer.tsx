import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'
import { withTableContext, useTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { BackerRewardsTable } from './BackerRewardsTable'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'
import { MobileSortModal } from './MobileSortModal'
import { useModal } from '@/shared/hooks/useModal'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FilterIcon } from '@/components/Icons'

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

  return (
    <ActionsContainer title={<TableHeader onOpenModal={openSortModal} />} className="bg-v3-bg-accent-80 p-0">
      <BackerRewardsTable />

      <MobileSortModal isOpen={isSortModalOpen} onClose={closeModal} />
    </ActionsContainer>
  )
}

export default withTableContext<ColumnId, BackerRewardsCellDataMap>(BackerRewardsTableContainer)
