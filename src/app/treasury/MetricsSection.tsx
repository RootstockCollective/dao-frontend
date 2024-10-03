import { HeaderTitle } from '@/components/Typography'
import { Table } from '@/components/Table'
import { TokenHoldingsStRIF } from '@/app/treasury/TokenHoldingsStRIF'

const tableData = [
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: 'stRIF',
    price: '—',
    holdings: <TokenHoldingsStRIF />,
  },
]
export const MetricsSection = () => (
  <div>
    <HeaderTitle className="mb-4">Metrics</HeaderTitle>
    <Table data={tableData} />
  </div>
)
