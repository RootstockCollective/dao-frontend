import { stRIF } from '@/lib/constants'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'

interface TotalBackingMetricProps {
  totalBacking: string
}

export const TotalBackingMetric = ({ totalBacking }: TotalBackingMetricProps) => {
  return <TokenAmountDisplay label="Total backing" amount={totalBacking} tokenSymbol={stRIF} />
}
