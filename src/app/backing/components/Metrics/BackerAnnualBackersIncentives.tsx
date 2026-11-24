import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Label, Span } from '@/components/Typography'
import { FIXED_ABI_PCT } from '@/lib/constants'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export const BackerAnnualBackersIncentives = () => {
  const isDesktop = useIsDesktop()

  return (
    <Metric title={<MetricTitle title={<Span variant="tag">Annual Backers Incentives</Span>} />}>
      <Header variant={isDesktop ? 'h1' : 'h3'}>
        {FIXED_ABI_PCT}
        <Label variant={isDesktop ? 'body-l' : 'body-s'}> % (estimated)</Label>
      </Header>
    </Metric>
  )
}
