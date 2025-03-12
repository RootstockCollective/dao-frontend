'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FC, ReactNode, useEffect } from 'react'
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

  useEffect(() => {
    if (!isConnected) {
      router.replace('/')
    }
  }, [isConnected, router])

  const isBuilder = gauge && gauge !== zeroAddress
  useEffect(() => {
    if (!isBuilder) {
      router.replace('/')
    }
  }, [gauge, router, isBuilder])

  const settingType = searchParams.get('type') as SettingType
  const isValidSettingType = searchParams && isSettingType(settingType)
  useEffect(() => {
    if (!isValidSettingType) {
      router.replace('/_not-found')
    }
  }, [searchParams, router, isValidSettingType])

  if (!isConnected || !isBuilder || !isValidSettingType) {
    return <LoadingSpinner />
  }
  return settings[settingType]
}
