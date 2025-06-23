import { FC } from 'react'
import { Popover } from '@/components/Popover'
import { Paragraph } from '@/components/TypographyNew'
import { CommonComponentProps } from '@/components/commonProps'

export const EstimatedRewardsContent: FC = () => (
  <div className={'bg-v3-text-80 rounded-sm shadow-sm flex flex-col w-full items-start p-6'}>
    <Paragraph className="text-v3-bg-accent-60 text-[14px] font-normal text-left">
      Estimated rewards for the next Cycle available to Backers.
      <br />
      <br />
      The displayed information is dynamic and may vary based on total rewards and user activity. This data is
      for informational purposes only.
    </Paragraph>
  </div>
)

export const EstimatedRewardsPopover: FC<CommonComponentProps> = ({ children, className }) => (
  <Popover
    trigger="hover"
    size="medium"
    position="left"
    background="light"
    contentSubContainerClassName="border-none shadow-none p-0"
    className={className}
    content={<EstimatedRewardsContent />}
  >
    <div className="cursor-pointer">{children}</div>
  </Popover>
)
