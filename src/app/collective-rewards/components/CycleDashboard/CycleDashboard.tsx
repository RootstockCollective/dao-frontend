'use client'

import { useGetCycleHistory } from '../../rewards/hooks/useGetCycleHistory'
import { useGetActiveBuildersCount } from '../../shared/hooks/useGetActiveBuildersCount'
import { useHandleErrors } from '../../utils'
import { CycleDashboardContent } from './CycleDashboardContent'

export const CycleDashboard = ({ className }: { className?: string }) => {
  const { data: cycles, isLoading, error } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()

  useHandleErrors({ error, title: 'Error loading cycle history' })

  return (
    <CycleDashboardContent
      cycles={cycles}
      buildersCount={buildersData?.count ?? null}
      isLoading={isLoading}
      className={className}
    />
  )
}
