import { useGetBackerABI } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Label, Span } from '@/components/Typography'
import { ABIFormula } from '../ABIFormula'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export const BackerAnnualBackersIncentives = () => {
  const isDesktop = useIsDesktop()
  const { address: backer } = useAccount()
  const { data: abiPct, isLoading, error } = useGetBackerABI(backer as Address)
  useHandleErrors({ error, title: 'Error loading backers abi' })

  if (isLoading) return <LoadingSpinner size="small" />

  return (
    <Metric
      title={
        <MetricTitle
          title={<Span variant="tag">Annual Backers Incentives</Span>}
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
          info={
            <Label variant={isDesktop ? 'body' : 'body-xs'}>
              Your Annual Backers Incentives (%) represents an <br /> estimate of the annualized percentage of
              rewards <br />
              that you could receive based on your <br /> backing allocations.
              <br />
              <br />
              The calculation follows the formula:
              <span className="flex justify-center">
                <ABIFormula />
              </span>
              <br />
              <br />
              This estimation is dynamic and may vary based on <br /> total rewards and user activity. <br />
              This data is for informational purposes only.
            </Label>
          }
        />
      }
    >
      <Header variant={isDesktop ? 'h1' : 'h3'}>
        {abiPct.toFixed(0)}
        <Label variant={isDesktop ? 'body-l' : 'body-s'}> % (estimated)</Label>
      </Header>
    </Metric>
  )
}
