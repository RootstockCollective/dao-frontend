import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { withTableContext } from '@/shared/context'
import { ReactElement, useState } from 'react'
import { BuilderFilterDropdown, BuilderFilterOptionId } from '../../BuilderFilterDropdown'
import { BuildersTable } from './BuildersTable'

const Title = ({ onSelected }: { onSelected: (value: BuilderFilterOptionId) => void }) => {
  return (
    <>
      <Header variant="h3" caps className="text-nowrap">
        The Collective Builders
      </Header>
      <BuilderFilterDropdown
        onSelected={onSelected}
        className="md:w-1/4 text-nowrap font-rootstock-sans font-normal text-base leading-6 text-v3-text-100 not-italic py-4 px-3"
      />
    </>
  )
}

const BuildersTableContainer = (): ReactElement => {
  const [filterOption, setFilterOption] = useState<BuilderFilterOptionId>('all')

  const handleFilterChange = (filterOption: BuilderFilterOptionId) => {
    setFilterOption(filterOption)
  }
  return (
    <ActionsContainer title={<Title onSelected={handleFilterChange} />} className="bg-v3-bg-accent-80">
      <CycleContextProvider>
        <BuildersTable filterOption={filterOption} />
      </CycleContextProvider>
    </ActionsContainer>
  )
}

export default withTableContext(BuildersTableContainer)
