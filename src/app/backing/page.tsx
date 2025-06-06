'use client'

import { envFlags } from '@/shared/context/FeatureFlag'
import { redirect } from 'next/navigation'
import { BackingPage } from './BackingPage'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'

export default function Backing() {
  const { v3_design } = envFlags

  if (!v3_design) {
    redirect('/')
  }

  return (
    v3_design && (
      <CycleContextProvider>
        <BackingPage />
      </CycleContextProvider>
    )
  )
}
