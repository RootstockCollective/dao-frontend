'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, ReactNode, useEffect } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderSettings } from './builder/BuilderSettings'

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
  const { data: gauge, status } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [address ?? zeroAddress],
  })

  useEffect(() => {
    if (!isConnected) {
      router.replace('/')
    }
  }, [isConnected, router])

  const isBuilder = gauge && gauge !== zeroAddress
  useEffect(() => {
    if (status === 'pending') {
      return
    }
    if (!isBuilder) {
      router.replace('/')
    }
  }, [gauge, router, isBuilder, status])

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
