import { BoltSvg } from '@/components/BoltSvg'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { HeaderTitle, Typography } from '@/components/Typography'
import React, { FC, ReactNode } from 'react'
import { Tooltip } from '../Tooltip'

export type RewardsSectionHeader = {
  title: string
  subtext: ReactNode
  utility: ReactNode
}
export const RewardsSectionHeader: FC<RewardsSectionHeader> = ({ title, subtext, utility }) => (
  <div className="flex justify-between w-full items-center gap-[24px]">
    <div className="flex flex-col items-start w-full">
      <div className="flex justify-center items-center gap-1">
        <HeaderTitle className="uppercase text-2xl leading-7 font-normal">{title}</HeaderTitle>
        {/* FIXME: to be removed outside*/}
        <div className="inline-flex items-center gap-1">
          <BoltSvg />
          <GlowingLabel>Boosted</GlowingLabel>
          <Tooltip text="Your rewards are boosted thanks to your NFT’s superpowers." />
        </div>
      </div>
      <Typography tagVariant="p" className="text-sm leading-7 font-normal font-rootstock-sans">
        {subtext}
      </Typography>
    </div>
    {utility}
  </div>
)
