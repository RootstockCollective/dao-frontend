import { MetricsCard } from '@/components/MetricsCard'
import { useGetWhitelistedBuildersLength } from '@/app/collective-rewards/hooks/useGetWhitelistedBuildersLength'
import { useAlertContext } from '@/app/providers'
import { useEffect } from 'react'

export const WhitelistedBuildersLengthMetrics = () => {
  const { data: wlBuildersLength, error: whitelistedBuildersError } = useGetWhitelistedBuildersLength()
  const { setMessage: setErrorMessage } = useAlertContext()

  useEffect(() => {
    if (whitelistedBuildersError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading whitelisted builders',
        content: whitelistedBuildersError.message,
      })
      console.error('🐛 whitelistedBuildersError:', whitelistedBuildersError)
    }
  }, [whitelistedBuildersError, setErrorMessage])

  /* TODO: MetricsCard should support loading and error status */
  return (
    <MetricsCard
      title="Total whitelisted builders"
      amount={Number(wlBuildersLength || 0n).toFixed()}
      borderless
    />
  )
}
