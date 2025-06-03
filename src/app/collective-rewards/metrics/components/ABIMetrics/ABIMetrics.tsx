import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { ABIFormula, useGetMetricsAbi, useGetMetricsAbiWithGraph } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'

const ABIMetricsContent = ({ abiPct, isLoading }: { abiPct: Big; isLoading: boolean }) => {
  return (
    <>
      <MetricsCard borderless>
        <MetricsCardTitle
          className="text-wrap"
          title="Annual Backers Incentives %"
          data-testid="abiPct"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                The Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                rewards that backers could receive based on their backing allocations.
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
            ),
            popoverProps: { size: 'medium', position: 'left-bottom' },
          }}
        />
        <>
          {withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
            amount: `${abiPct.toFixed(0)}%`,
            isLoading,
          })}
        </>
      </MetricsCard>
    </>
  )
}

const ABIMetricsFromChain = () => {
  console.time('ABIMetricsFromChain')
  const { data: abiPct, isLoading, error } = useGetMetricsAbi()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  console.timeEnd('ABIMetricsFromChain')
  return <ABIMetricsContent abiPct={abiPct} isLoading={isLoading} />
}

const ABIMetricsWTheGraph = () => {
  console.time('ABIMetricsWTheGraph')
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithGraph()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  console.timeEnd('ABIMetricsWTheGraph')
  return <ABIMetricsContent abiPct={abiPct} isLoading={isLoading} />
}

export const ABIMetrics = () => {
  const {
    flags: { use_the_graph },
  } = useFeatureFlags()
  return use_the_graph ? <ABIMetricsWTheGraph /> : <ABIMetricsFromChain />
}
