import { MetricsCard } from '@/components/MetricsCard'
import { useGetWhitelistedBuildersLength } from '@/app/bim/hooks/useGetWhitelistedBuildersLength'

export const WhitelistedBuildersLengthMetrics = () => {
  const { data: wlBuildersLength } = useGetWhitelistedBuildersLength()

  /* TODO: MetricsCard should support loading and error status */
  return <MetricsCard title="Total whitelisted builders" amount={Number(wlBuildersLength || 0n).toFixed()} />
}
