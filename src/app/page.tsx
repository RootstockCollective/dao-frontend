'use client'
import { Suspense } from 'react'
import { User } from './user/page'
import { BalancesProvider } from './user/Balances/context/BalancesContext'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BalancesProvider>
        <User />
      </BalancesProvider>
    </Suspense>
  )
}
