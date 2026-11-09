'use client'

import { ReactElement } from 'react'

import { BackersAllocations, UnclaimedRewardsMetric } from '.'

export const MyBacking = (): ReactElement => (
  <div className="flex w-full flex-col gap-4 md:gap-0 md:flex-row">
    <UnclaimedRewardsMetric />
    <BackersAllocations />
  </div>
)
