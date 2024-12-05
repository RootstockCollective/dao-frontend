import { SearchContextProvider } from '@/app/collective-rewards/shared'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BuilderStateFlagsArray, useGetBuildersByState } from '@/app/collective-rewards/user/'
import { ActiveBuildersGrid } from '@/app/collective-rewards/active-builders'
import { Search } from '@/app/collective-rewards/shared'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'

export const isActive = (stateFlags?: BuilderStateFlags) => {
  const activeFlags: BuilderStateFlagsArray = ['kycApproved', 'communityApproved']
  return activeFlags.every(flag => stateFlags?.[flag])
}

const isDeactivated = ({ gauge, stateFlags }: Builder) =>
  !(gauge && stateFlags && stateFlags.activated && !stateFlags.communityApproved)

const filterFunction = (builder: Builder, status: string) => {
  if (status === 'all') return true
  if (status === 'active') return isActive(builder.stateFlags)
  if (status === 'inProgress') return !isActive(builder.stateFlags)
  return false
}

export const ActiveBuildersContent = () => {
  const { data: builders, isLoading, error } = useGetBuildersByState(undefined, true)
  const filteredBuilders = builders?.filter(isDeactivated)
  useHandleErrors({ error, title: 'Error loading builders' })

  const status = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'In Progress', value: 'inProgress' },
  ]

  return (
    <>
      <SearchContextProvider builders={filteredBuilders} filterFunction={filterFunction}>
        <Search status={status} />
        {withSpinner(ActiveBuildersGrid)({ isLoading })}
      </SearchContextProvider>
    </>
  )
}
