import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useGetBuilders } from '@/app/collective-rewards/user'
import { ActionsContainer } from '@/components/containers'
import { Header, Span } from '@/components/Typography'
import { withTableContext, useTableContext, useTableActionsContext } from '@/shared/context'
import { ReactElement, useMemo, useState } from 'react'
import {
  BuilderFilterDropdown,
  BuilderFilterOption,
  BuilderFilterOptionId,
  builderFilterOptions,
} from './BuilderFilterDropdown'
import { BuildersTable } from './BuildersTable'
import { BuilderCellDataMap, ColumnId } from './BuilderTable.config'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FilterIcon, TrashIcon } from '@/components/Icons'
import { MobileFilterModal } from './MobileFilterModal'
import { builderFilterMap } from './utils/builderFilters'
import { useModal } from '@/shared/hooks/useModal'

const Title = ({
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
      <div className="flex items-center justify-between">
        <Header variant="h3" caps className="text-nowrap">
          The Collective Builders
        </Header>
        {isDesktop ? (
          <BuilderFilterDropdown
            onSelected={onSelected}
            options={builderFilterOptions}
            className="md:w-1/4 text-nowrap font-rootstock-sans font-normal text-base leading-6 text-v3-text-100 not-italic py-4 px-3"
          />
        ) : (
          <FilterIcon className="w-6 h-6 cursor-pointer" onClick={onOpenModal} />
        )}
      </div>

      {/* Active Filter Banner - Mobile Only */}
      {!isDesktop && currentFilter !== 'all' && (
        <div className="w-full flex items-center justify-left">
          <Span variant="body-xs" className="text-v3-text-40">
            FILTERING BY:
          </Span>
          <TrashIcon
            size={16}
            className="text-v3-text-100 cursor-pointer ml-4 mr-1"
            onClick={() => onSelected('all')}
          />
          <Span variant="body-s">{builderFilterOptions.find(opt => opt.id === currentFilter)?.label}</Span>
        </div>
      )}
    </div>
  )
}

const BuildersTableContainer = (): ReactElement => {
  const [filterOption, setFilterOption] = useState<BuilderFilterOptionId>('all')
  const { isModalOpened: isFilterModalOpen, openModal: openFilterModal, closeModal } = useModal()

  // Access table context for sorting
  const { sort } = useTableContext<ColumnId, BuilderCellDataMap>()
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

  const handleApplyFilter = (filter: BuilderFilterOptionId, sortColumn: ColumnId | null) => {
    setFilterOption(filter)
    // Apply sorting
    if (sortColumn) {
      dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: sortColumn, direction: 'desc' } })
    } else {
      dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: null, direction: null } })
    }
    closeModal()
  }

  const handleResetFilter = () => {
    setFilterOption('all')
    // Reset sorting in table context
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: null, direction: null } })
    closeModal()
  }

  return (
    <ActionsContainer
      title={
        <Title
          onSelected={handleFilterChange}
          builderFilterOptions={availableOptions}
          currentFilter={filterOption}
          onOpenModal={openFilterModal}
        />
      }
      className="bg-v3-bg-accent-80"
    >
      <CycleContextProvider>
        <BuildersTable filterOption={filterOption} />
      </CycleContextProvider>

      <MobileFilterModal
        isOpen={isFilterModalOpen}
        filterOptions={availableOptions}
        currentFilter={filterOption}
        currentSort={sort.columnId}
        onClose={closeModal}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </ActionsContainer>
  )
}

export default withTableContext<ColumnId, BuilderCellDataMap>(BuildersTableContainer)
