import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { ABIFormula } from '@/app/backing/components/ABIFormula'

export const ABI = () => {
  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading }) => (
        <RewardCard
          isLoading={isLoading}
          title="Annual Backers Incentives"
          info={
            <span className="font-rootstock-sans text-sm font-normal">
              Your Annual Backers Incentives (%) represents an estimate of the annualized percentage of
              rewards that you could receive based on your backing allocations.
              <br />
              <br />
              The calculation follows the formula:
              <span className="flex justify-center">
                <ABIFormula />
              </span>
              <br />
              <br />
              This estimation is dynamic and may vary based on total rewards and user activity. This data is
              for informational purposes only.
            </span>
          }
          content={`${abiPct.toFixed(2)}%`}
        />
      )}
    />
  )
}
