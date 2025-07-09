import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { FC } from 'react'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useGetBackerABI } from '@/app/collective-rewards/shared'
import { ABIFormula } from '@/app/backing/components/ABIFormula'

interface BackerABIProps {
  backer: Address
}
export const BackerABI: FC<BackerABIProps> = ({ backer }) => {
  const { data: abiPct, isLoading, error } = useGetBackerABI(backer)
  useHandleErrors({ error, title: 'Error loading backer abi' })

  return (
    <RewardCard
      isLoading={isLoading}
      title="ABI"
      info={
        <span className="font-rootstock-sans text-sm font-normal">
          Your Annual Backers Incentives (%) represents an estimate of the annualized percentage of rewards
          that you could receive based on your backing allocations.
          <br />
          <br />
          The calculation follows the formula:
          <span className="flex justify-center">
            <ABIFormula />
          </span>
          <br />
          <br />
          This estimation is dynamic and may vary based on total rewards and user activity. This data is for
          informational purposes only.
        </span>
      }
      content={`${abiPct.toFixed(2)}%`}
    />
  )
}
