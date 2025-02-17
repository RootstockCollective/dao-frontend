import { BoltSvg } from '@/components/BoltSvg'
import { FadedGlowingLabel } from '@/components/Label/GlowingLabel'
import { HeaderTitle, Typography } from '@/components/Typography'
import React, { FC, ReactNode } from 'react'
import { Tooltip } from '../Tooltip'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'

export type RewardsSectionHeader = {
  title: string
  subtext: ReactNode
  utility: ReactNode
  isBacker?: boolean
}
export const RewardsSectionHeader: FC<RewardsSectionHeader> = ({ title, subtext, utility, isBacker }) => {
  const { isBoosted, hasActiveCampaign } = useNFTBoosterContext()

  return (
    <div className="flex justify-between w-full items-center gap-[24px]">
      <div className="flex flex-col items-start w-full">
        <div className="flex justify-center items-center gap-1">
          <HeaderTitle className="uppercase text-2xl leading-7 font-normal">{title}</HeaderTitle>
          {isBacker && hasActiveCampaign && isBoosted && (
            <div className="inline-flex items-center gap-1">
              <BoltSvg />
              <FadedGlowingLabel>Boosted</FadedGlowingLabel>
              <Tooltip text="Your rewards are boosted thanks to your NFT’s superpowers." />
            </div>
          )}
        </div>
        <Typography tagVariant="p" className="text-sm leading-7 font-normal font-rootstock-sans">
          {subtext}
        </Typography>
      </div>
      {utility}
    </div>
  )
}
