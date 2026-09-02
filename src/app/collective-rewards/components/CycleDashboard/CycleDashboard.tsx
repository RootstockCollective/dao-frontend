'use client'

import { useCycleDashboard } from '../../context/CycleDashboardContext'
import { CycleDashboardContent } from './CycleDashboardContent'

export const CycleDashboard = ({ className }: { className?: string }) => {
  const { cycles, selectedCycle, selectCycle, buildersCount, isLoading } = useCycleDashboard()

  return (
    <CycleDashboardContent
      cycles={cycles}
      selectedCycle={selectedCycle}
      onSelectCycle={selectCycle}
      buildersCount={buildersCount}
      isLoading={isLoading}
      className={className}
    />
  )
}
