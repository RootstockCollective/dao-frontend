'use client'

import { Header } from '@/components/Typography'

import { CycleDashboard } from './components/CycleDashboard'
import { DashboardMetrics } from './components/DashboardMetrics'
import { RewardsActionsSection } from './components/RewardsCallToAction'
import { CycleDashboardProvider } from './context/CycleDashboardContext'

const NAME = 'Collective Rewards'

/**
 * Sections carry headings for the document outline even where the design shows none, so the
 * page is navigable by landmark rather than being one flat run of cards.
 */
export const CollectiveRewardsPage = () => (
  <div className="flex flex-col">
    <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
      {NAME}
    </Header>

    <CycleDashboardProvider>
      <div className="flex flex-col gap-2">
        <section aria-labelledby="cr-summary-heading">
          <h2 id="cr-summary-heading" className="sr-only">
            Rewards summary
          </h2>
          <DashboardMetrics />
        </section>

        <CycleDashboard />

        <section aria-labelledby="cr-actions-heading">
          <h2 id="cr-actions-heading" className="sr-only">
            Take part
          </h2>
          <RewardsActionsSection />
        </section>
      </div>
    </CycleDashboardProvider>
  </div>
)
