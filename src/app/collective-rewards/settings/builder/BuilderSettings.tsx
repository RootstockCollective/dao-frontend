import { Header, Typography } from '@/components/Typography'
import { FC } from 'react'
import { BuilderRewardsSettingsForm, BuilderRewardsSettingsMetrics } from '.'
import { BuilderSettingsProvider } from './context'

export const BuilderSettings: FC = () => {
  return (
    <div className="flex flex-col items-start self-stretch grow shrink-0 gap-6 h-full">
      <Header
        variant="h1"
        fontFamily="kk-topo"
        className="text-2xl leading-tight font-normal text-left uppercase tracking-[-0.96px]"
      >
        Builder Rewards Settings
      </Header>
      <BuilderSettingsProvider>
        <BuilderRewardsSettingsMetrics />
        <div className="flex flex-col gap-2.5 items-start self-stretch">
          <Typography
            tagVariant="label"
            className="font-rootstock-sans text-base leading-4 font-normal w-[606px]"
          >
            This update will take effect after the cooldown period, in the meantime it will be displayed in
            “next %” metric
          </Typography>
        </div>
        <BuilderRewardsSettingsForm />
      </BuilderSettingsProvider>
    </div>
  )
}
