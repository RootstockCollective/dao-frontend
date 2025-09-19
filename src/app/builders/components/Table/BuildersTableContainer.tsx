import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useGetBuilders } from '@/app/collective-rewards/user'
import { ActionsContainer } from '@/components/containers'
import { withTableContext, useTableContext, useTableActionsContext } from '@/shared/context'
import { SortDirection } from '@/shared/context/TableContext/types'
import { ReactElement, useMemo, useState } from 'react'
import { BuilderFilterOption, BuilderFilterOptionId, builderFilterOptions } from './BuilderFilterDropdown'
import { BuildersTable } from './BuildersTable'
import { BuilderCellDataMap, ColumnId } from './BuilderTable.config'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { MobileFilterModal } from './MobileFilterModal'
import { builderFilterMap } from './utils/builderFilters'
import { useModal } from '@/shared/hooks/useModal'
import { BuildersTableTitle } from './BuildersTableTitle'
import { MobileCurrentFilter } from './MobileCurrentFilter'

const BuildersTableHeader = ({
  onSelected,
  builderFilterOptions,
  currentFilter,
  onOpenModal,
}: {
  onSelected: (value: BuilderFilterOptionId) => void
  builderFilterOptions: BuilderFilterOption[]
  currentFilter: BuilderFilterOptionId
  onOpenModal: () => void
}) => {
  const isDesktop = useIsDesktop()

  return (
    <div className="flex flex-col gap-2 w-full">
      <BuildersTableTitle
        onFilterSelected={onSelected}
        builderFilterOptions={builderFilterOptions}
        currentFilter={currentFilter}
        onOpenModal={onOpenModal}
      />

      {/* Active Filter Banner - Mobile Only */}
      {!isDesktop && (
        <MobileCurrentFilter
          currentFilterOption={builderFilterOptions.find(opt => opt.id === currentFilter) || null}
          onClearFilter={() => onSelected('all')}
        />
      )}
    </div>
  )
}

const BuildersTableContainer = (): ReactElement => {
  const [filterOption, setFilterOption] = useState<BuilderFilterOptionId>('all')
  const { isModalOpened: isFilterModalOpen, openModal: openFilterModal, closeModal } = useModal()

  // Access table context for sorting
  const { sort, defaultSort } = useTableContext<ColumnId, BuilderCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BuilderCellDataMap>()

  const { data: buildersData } = useGetBuilders()
  const builders = Object.values(buildersData ?? {})

  // Filter out options that have no builders
  const availableOptions = useMemo(() => {
    // TODO: we could count the builders by filter option first
    return builderFilterOptions.filter(option => {
      if (option.id === 'all') return true // Always include 'all' option
      const builderCount = builders.filter(builderFilterMap[option.id]).length
      return builderCount > 0
    })
  }, [builders])

  const handleFilterChange = (filterOption: BuilderFilterOptionId) => {
    setFilterOption(filterOption)
  }

  const handleApplyFilter = (
    filter: BuilderFilterOptionId,
    sortColumn: ColumnId | null,
    sortDirection: SortDirection | null,
  ) => {
    setFilterOption(filter)
    const sort = sortColumn ?? defaultSort.columnId
    const direction = sortDirection ?? defaultSort.direction
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: sort, direction } })
    closeModal()
  }

  const handleResetFilter = () => {
    setFilterOption('all')
    // Reset sorting to default
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: defaultSort.columnId, direction: defaultSort.direction },
    })
    closeModal()
  }

  return (
    <ActionsContainer
      title={
        <BuildersTableHeader
          onSelected={handleFilterChange}
          builderFilterOptions={availableOptions}
          currentFilter={filterOption}
          onOpenModal={openFilterModal}
        />
      }
      className="bg-v3-bg-accent-80 px-0 md:px-4"
    >
      <CycleContextProvider>
        <BuildersTable filterOption={filterOption} />
      </CycleContextProvider>

      <MobileFilterModal
        isOpen={isFilterModalOpen}
        filterOptions={availableOptions}
        currentFilter={filterOption}
        currentSort={sort.columnId}
        currentSortDirection={sort.direction}
        onClose={closeModal}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </ActionsContainer>
  )
}

export default withTableContext<ColumnId, BuilderCellDataMap>(BuildersTableContainer)
