'use client'

import { useAccount } from 'wagmi'

import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { ReactElement } from 'react'
import { zeroAddress } from 'viem'
import { BackersAllocations, UnclaimedRewardsMetric } from '.'

export const MyBacking = (): ReactElement => {
  const { address: userAddress } = useAccount()

  return (
    <div className="flex w-full flex-col gap-4 md:gap-0 md:flex-row">
      <BackerRewardsContextProvider backer={userAddress ?? zeroAddress} tokens={TOKENS}>
        <UnclaimedRewardsMetric />
      </BackerRewardsContextProvider>
      <BackersAllocations />
    </div>
  )
}
