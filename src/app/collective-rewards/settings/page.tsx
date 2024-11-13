import { useRouter, useSearchParams } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { BuilderSettings } from './builder/BuilderSettings'

const settingTypes = ['builder'] as const
type SettingType = (typeof settingTypes)[number]

const isSettingType = (type: string): type is SettingType => settingTypes.includes(type as SettingType)

const settings: Record<SettingType, ReactNode> = {
  builder: <BuilderSettings />,
}

export const Settings: FC = () => {
  const searchParams = useSearchParams()
  const settingType = searchParams?.get('type') as SettingType

  const router = useRouter()

  if (!isSettingType(settingType)) {
    router.push('/_not-found')
  }

  return settings[settingType]
}
