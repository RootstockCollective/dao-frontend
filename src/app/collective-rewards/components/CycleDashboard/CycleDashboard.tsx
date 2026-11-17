'use client'

import { useCycleDashboard } from '../../context/CycleDashboardContext'
import { CycleDashboardContent } from './CycleDashboardContent'

export const CycleDashboard = ({ className }: { className?: string }) => {
  const { cycles, backingSeries, selectedCycle, selectCycle, buildersCount, isLoading } = useCycleDashboard()

  return (
    <CycleDashboardContent
      cycles={cycles}
      backingSeries={backingSeries}
      selectedCycle={selectedCycle}
      onSelectCycle={selectCycle}
      buildersCount={buildersCount}
      isLoading={isLoading}
      className={className}
    />
  )
}
