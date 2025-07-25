import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { withTableContext } from '@/shared/context'
import { ReactElement, useState, useMemo } from 'react'
import { BuilderFilterDropdown, BuilderFilterOptionId } from '../../BuilderFilterDropdown'
import { BuildersTable } from './BuildersTable'
import { useGetBuilders } from '@/app/collective-rewards/user'
import { BuilderFilterOption, builderFilterOptions } from '../../BuilderFilterDropdown/constants'
import { Builder } from '@/app/collective-rewards/types'
import {
  isBuilderActive,
  isBuilderDeactivated,
  isBuilderKycRevoked,
  isBuilderPaused,
  isBuilderSelfPaused,
} from '@/app/collective-rewards/utils'

const filterMap: Record<BuilderFilterOptionId, (builder: Builder) => boolean> = {
  active: (builder: Builder) => isBuilderActive(builder.stateFlags),
  deactivated: (builder: Builder) => isBuilderDeactivated(builder),
  kycRevoked: (builder: Builder) => isBuilderKycRevoked(builder.stateFlags),
  paused: (builder: Builder) =>
    isBuilderPaused(builder.stateFlags) || isBuilderSelfPaused(builder.stateFlags),
  inProgress: (builder: Builder) => !isBuilderActive(builder.stateFlags),
  all: () => true,
}

const Title = ({
  onSelected,
  builderFilterOptions,
}: {
  onSelected: (value: BuilderFilterOptionId) => void
  builderFilterOptions: BuilderFilterOption[]
}) => {
  return (
    <>
      <Header variant="h3" caps className="text-nowrap">
        The Collective Builders
      </Header>
      <BuilderFilterDropdown
        onSelected={onSelected}
        options={builderFilterOptions}
        className="md:w-1/4 text-nowrap font-rootstock-sans font-normal text-base leading-6 text-v3-text-100 not-italic py-4 px-3"
      />
    </>
  )
}

const BuildersTableContainer = (): ReactElement => {
  const [filterOption, setFilterOption] = useState<BuilderFilterOptionId>('all')

  const { data: buildersData } = useGetBuilders()
  const builders = Object.values(buildersData ?? {})

  // Filter out options that have no builders
  const availableOptions = useMemo(() => {
    // TODO: we could count the builders by filter option first
    return builderFilterOptions.filter(option => {
      if (option.id === 'all') return true // Always include 'all' option
      const builderCount = builders.filter(filterMap[option.id]).length
      return builderCount > 0
    })
  }, [builders])

  const handleFilterChange = (filterOption: BuilderFilterOptionId) => {
    setFilterOption(filterOption)
  }

  return (
    <ActionsContainer
      title={<Title onSelected={handleFilterChange} builderFilterOptions={availableOptions} />}
      className="bg-v3-bg-accent-80"
    >
      <CycleContextProvider>
        <BuildersTable filterOption={filterOption} />
      </CycleContextProvider>
    </ActionsContainer>
  )
}

export default withTableContext(BuildersTableContainer)
