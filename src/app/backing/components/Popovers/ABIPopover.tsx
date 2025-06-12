import { ReactNode } from 'react'
import { Popover } from '@/components/Popover'
import { Paragraph } from '@/components/TypographyNew'
import { ABIFormula } from '@/app/backing/components/ABIFormula'

export const ABIPopover = ({ children }: { children: ReactNode }) => (
  <Popover
    content={
      <div className="bg-v3-text-80 rounded-sm shadow-sm flex flex-col w-full items-start p-6">
        <Paragraph className="text-v3-bg-accent-60 text-[14px] font-normal text-left">
          The Annual Backers Incentives (%) represents an estimate of the annualized percentage of rewards
          that backers could receive based on their backing allocations.
          <br />
          <br />
          The calculation follows the formula:
          <span className="flex justify-center pt-4">
            <ABIFormula />
          </span>
          <br />
          <br />
          This estimation is dynamic and may vary based on total rewards and user activity. This data is for
          informational purposes only.
        </Paragraph>
      </div>
    }
    trigger="hover"
    size="medium"
    position="left"
    background="light"
    contentSubContainerClassName="border-none shadow-none p-0"
  >
    <div className="w-full flex flex-col items-start">{children}</div>
  </Popover>
)
