import { ActiveBuildersGrid } from '@/app/collective-rewards/active-builders'
import { Search, SearchContextProvider } from '@/app/collective-rewards/shared'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user/'
import {
  isBuilderCommunityBanned,
  isBuilderKycRevoked,
  isBuilderPaused,
  useHandleErrors,
} from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

export const isActive = (stateFlags?: BuilderStateFlags) => {
  const activeFlags = ['kycApproved', 'communityApproved']
  return activeFlags.every(flag => stateFlags?.[flag as keyof BuilderStateFlags])
}

const filterFunction = (builder: Builder, status: string) => {
  if (status === 'all') return true
  if (status === 'active') return isActive(builder.stateFlags)
  if (status === 'inProgress') return !isActive(builder.stateFlags)
  return false
}

export const ActiveBuildersContent = () => {
  const { data: builders, isLoading, error } = useGetBuildersByState(undefined, true)
  useHandleErrors({ error, title: 'Error loading builders' })
  const filteredBuilders = builders.filter(
    builder =>
      !isBuilderCommunityBanned(builder) && // remove deactivated builders
      !isBuilderKycRevoked(builder.stateFlags) && // remove kyc revoked builders
      !isBuilderPaused(builder.stateFlags), // remove paused builders
  )

  const status = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'In Progress', value: 'inProgress' },
  ]

  return (
    <>
      <SearchContextProvider builders={filteredBuilders} filterFunction={filterFunction}>
        <Search status={status} />
        <>{withSpinner(ActiveBuildersGrid)({ isLoading })}</>
      </SearchContextProvider>
    </>
  )
}
