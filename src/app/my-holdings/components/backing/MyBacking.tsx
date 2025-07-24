'use client'

import { useAccount } from 'wagmi'

import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { ReactElement } from 'react'
import { zeroAddress } from 'viem'
import { BackersAllocations, UnclaimedRewardsMetric } from '.'

export const MyBacking = ({ currency = 'USD' }: { currency?: string }): ReactElement => {
  const { address: userAddress } = useAccount()

  return (
    <div className="flex w-full">
      <BackerRewardsContextProvider backer={userAddress ?? zeroAddress} tokens={TOKENS}>
        <UnclaimedRewardsMetric currency={currency} />
      </BackerRewardsContextProvider>
      <BackersAllocations />
    </div>
  )
}
