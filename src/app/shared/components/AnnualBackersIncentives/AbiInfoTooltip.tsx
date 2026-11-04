import { ABIFormula } from '@/app/backing/components/ABIFormula'
import { Paragraph } from '@/components/Typography'

export const ABI_INFO_TOOLTIP_CLASS_NAME = 'max-w-sm text-sm'

export const AbiInfoTooltip = () => (
  <Paragraph className="text-sm font-normal text-left">
    The Annual Backers Incentives (%) represents an estimate of the annualized percentage of rewards that
    backers could receive based on their backing allocations.
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
)
