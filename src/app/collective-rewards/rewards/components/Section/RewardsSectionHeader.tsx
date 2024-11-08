import { Button } from '@/components/Button'
import { ConfigSvg } from '@/components/ConfigSvg'
import { HeaderTitle, Typography } from '@/components/Typography'
import { FC } from 'react'

export type RewardsSectionHeader = {
  title: string
  subtext: string
}
export const RewardsSectionHeader: FC<RewardsSectionHeader> = ({ title, subtext }) => (
  <div className="flex justify-between w-full items-center gap-2.5">
    <div className="flex flex-col items-start w-full">
      <HeaderTitle className="uppercase text-2xl leading-7 font-normal">{title}</HeaderTitle>
      <Typography tagVariant="p" className="text-sm leading-7 font-normal font-rootstock-sans">
        {subtext}
      </Typography>
    </div>
    <Button variant="outlined" className="flex w-[54px] self-stretch border-[#2D2D2D]">
      <ConfigSvg />
    </Button>
  </div>
)
