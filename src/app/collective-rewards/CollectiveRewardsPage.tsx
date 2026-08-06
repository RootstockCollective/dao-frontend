'use client'

import { Header } from '@/components/Typography'

import { CycleDashboard } from './components/CycleDashboard'
import { DashboardMetrics } from './components/DashboardMetrics'
import { RewardsActionsSection } from './components/RewardsCallToAction'

const NAME = 'Collective Rewards'

export const CollectiveRewardsPage = () => (
  <div className="flex flex-col">
    <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
      {NAME}
    </Header>

    <div className="flex flex-col gap-2">
      {/* What the programme is paying right now */}
      <DashboardMetrics />

      {/* How it got here: backing over time, this cycle's split, and every cycle before it */}
      <CycleDashboard />

      {/* What a visitor can do about it */}
      <RewardsActionsSection />
    </div>
  </div>
)
