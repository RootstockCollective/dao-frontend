import { Header } from '@/components/Typography'
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
    <Header variant="h2" className="mb-[17px]">
      Metrics
    </Header>
    <Table data={tableData} />
  </div>
)
