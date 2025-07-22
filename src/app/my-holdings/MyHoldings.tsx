'use client'

import { Header } from '@/components/TypographyNew'
import { useAccount } from 'wagmi'

import { ReactElement } from 'react'
import { MyBacking } from './components/backing'

export const MyHoldings = () => {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col items-start w-full h-full py-6 px-7 gap-2 rounded-sm">
      {isConnected && <MyActivityAndBalances />}
    </div>
  )
}

const MyActivityAndBalances = ({ currency = 'USD' }: { currency?: string }): ReactElement => {
  return (
    <div className="flex flex-col w-full px-6 pt-6 pb-10 gap-10 rounded-sm bg-v3-bg-accent-80">
      <Header caps variant="h3">
        My Activity & Balances
      </Header>
      <MyBacking currency={currency} />
      <hr className="w-full bg-v3-bg-accent-60 border-none h-px self-stretch" />
      <div className="flex w-full">PLACEHOLDER token balances</div>
    </div>
  )
}
