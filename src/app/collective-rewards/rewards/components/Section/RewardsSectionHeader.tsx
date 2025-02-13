import { HeaderTitle, Typography } from '@/components/Typography'
import React, { FC, ReactNode } from 'react'

export type RewardsSectionHeader = {
  title: string
  subtext: ReactNode
  utility: ReactNode
}
export const RewardsSectionHeader: FC<RewardsSectionHeader> = ({ title, subtext, utility }) => (
  <div className="flex justify-between w-full items-center gap-[24px]">
    <div className="flex flex-col items-start w-full">
      <HeaderTitle className="uppercase text-2xl leading-7 font-normal">{title}</HeaderTitle>
      <Typography tagVariant="p" className="text-sm leading-7 font-normal font-rootstock-sans">
        {subtext}
      </Typography>
    </div>
    {utility}
  </div>
)
