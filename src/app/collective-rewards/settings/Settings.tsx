'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { BuilderSettings } from './builder/BuilderSettings'
import { useAccount } from 'wagmi'
import { useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { zeroAddress } from 'viem'

const settingTypes = ['builder'] as const
type SettingType = (typeof settingTypes)[number]

const isSettingType = (type: string): type is SettingType => settingTypes.includes(type as SettingType)

const settings: Record<SettingType, ReactNode> = {
  builder: <BuilderSettings />,
}

export const Settings: FC = () => {
  const { isConnected, address } = useAccount()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: gauge, isLoading: isLoadingGauge } = useGetBuilderToGauge(address!)

  if (!isConnected) {
    router.push('/')
    // return to avoid rendering the component while redirecting
    return
  }

  if (isLoadingGauge) {
    return <LoadingSpinner />
  }
  if (!gauge || gauge === zeroAddress) {
    router.push('/')
    return
  }

  const settingType = searchParams?.get('type') as SettingType

  if (!settingType || !isSettingType(settingType)) {
    router.push('/_not-found')
    return
  }

  return settings[settingType]
}
