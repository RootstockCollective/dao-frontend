import { useGetBackerABI } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
import { ABIFormula } from '../ABIFormula'

export const BackerAnnualBackersIncentives = () => {
  const { address: backer } = useAccount()
  const { data: abiPct, isLoading, error } = useGetBackerABI(backer as Address)
  useHandleErrors({ error, title: 'Error loading backers abi' })

  if (isLoading) return <LoadingSpinner size="small" />

  return (
    <Metric
      title={
        <MetricTitle
          title={
            <Typography
              variant="tag"
              className="text-v3-bg-accent-0 text-base font-medium font-rootstock-sans leading-[150%]"
            >
              Annual Backers Incentives
            </Typography>
          }
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
          info={
            <Typography>
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
            </Typography>
          }
        />
      }
    >
      <Header variant="h1">
        {abiPct.toFixed(0)} <Typography variant="body-l">% (estimated)</Typography>
      </Header>
    </Metric>
  )
}
