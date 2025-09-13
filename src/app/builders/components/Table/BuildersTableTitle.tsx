import { Header } from '@/components/Typography'
import { FilterIcon } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { BuilderFilterDropdown, BuilderFilterOption, BuilderFilterOptionId } from './BuilderFilterDropdown'

interface BuildersTableTitleProps {
  onFilterSelected: (value: BuilderFilterOptionId) => void
  builderFilterOptions: BuilderFilterOption[]
  currentFilter: BuilderFilterOptionId
  onOpenModal: () => void
}

export const BuildersTableTitle = ({
  onFilterSelected,
  builderFilterOptions,
  currentFilter,
  onOpenModal,
}: BuildersTableTitleProps) => {
  const isDesktop = useIsDesktop()
  const isSorted = false //TODO: sort.columnId !== null

  return (
    <div className="flex items-center justify-between">
      <Header variant="h3" caps className="text-nowrap">
        The Collective Builders
      </Header>
      {isDesktop ? (
        <BuilderFilterDropdown
          onSelected={onFilterSelected}
          options={builderFilterOptions}
          className="md:w-1/4 text-nowrap font-rootstock-sans font-normal text-base leading-6 text-v3-text-100 not-italic py-4 px-3"
        />
      ) : (
        <FilterIcon
          className="w-6 h-6 cursor-pointer"
          onClick={onOpenModal}
          highlighted={currentFilter !== 'all' || isSorted}
        />
      )}
    </div>
  )
}
