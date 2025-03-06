'use client'
import { Suspense } from 'react'
import User from './user/page'
import { BalancesProvider } from './user/Balances/context/BalancesContext'

export default function Home() {
  return (
    <BalancesProvider>
      <User />
    </BalancesProvider>
  )
}
