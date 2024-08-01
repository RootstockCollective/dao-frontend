import { Header } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { TokenHoldings } from '@/app/treasury/TokenHoldings'
import { TokenHoldingsStRIF } from '@/app/treasury/TokenHoldingsStRIF'

const tableData = [
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: 'RIF',
    price: <RenderTokenPrice symbol="RIF" contextToUse="prices" />,
    holdings: <TokenHoldings symbol="RIF" />,
  },
  {
    token: 'Rootstock Bitcoin',
    symbol: 'RBTC',
    price: <RenderTokenPrice symbol="RBTC" contextToUse="prices" />,
    holdings: <TokenHoldings symbol="RBTC" />,
  },
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: 'stRIF',
    price: '—',
    holdings: <TokenHoldingsStRIF />,
  },
]

export const TotalTokenHoldingsSection = () => (
  <div>
    <Header variant="h2" className="mb-[17px]">
      Total token holdings
    </Header>
    <Table data={tableData} />
  </div>
)
