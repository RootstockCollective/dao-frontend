import { Paragraph } from '@/components/Typography'
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
    <Paragraph className="font-semibold text-[18px] mb-[17px]">Metrics</Paragraph>
    <Table data={tableData} />
  </div>
)
