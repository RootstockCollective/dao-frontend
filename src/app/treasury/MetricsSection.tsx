import { HeaderTitle } from '@/components/Typography'
import { Table } from '@/components/Table'
import { TokenHoldingsStRIF } from '@/app/treasury/TokenHoldingsStRIF'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatCurrency } from '@/lib/utils'

const StRIFPrice = () => {
  const { prices } = usePricesContext()
  const symbol = 'stRIF'
  return formatCurrency(prices[symbol]?.price || 0)
}

const tableData = [
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: 'stRIF',
    price: <StRIFPrice />,
    holdings: <TokenHoldingsStRIF />,
  },
]
export const MetricsSection = () => (
  <div>
    <HeaderTitle className="mb-4">Metrics</HeaderTitle>
    <Table data={tableData} />
  </div>
)
