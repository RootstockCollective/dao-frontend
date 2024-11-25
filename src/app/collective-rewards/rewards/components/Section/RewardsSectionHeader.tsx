import { ButtonProps } from '@/components/Button'
import { HeaderTitle, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import { SettingsButton } from '@/app/collective-rewards/rewards'

export type RewardsSectionHeader = {
  title: string
  subtext: ReactNode
  onSettingsOpen: ButtonProps['onClick']
}
export const RewardsSectionHeader: FC<RewardsSectionHeader> = ({ title, subtext, onSettingsOpen }) => (
  <div className="flex justify-between w-full items-center gap-2.5">
    <div className="flex flex-col items-start w-full">
      <HeaderTitle className="uppercase text-2xl leading-7 font-normal">{title}</HeaderTitle>
      <Typography tagVariant="p" className="text-sm leading-7 font-normal font-rootstock-sans">
        {subtext}
      </Typography>
    </div>
    <SettingsButton onClick={onSettingsOpen} />
  </div>
)
