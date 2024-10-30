import { HeaderTitle } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { TokenHoldings } from '@/app/treasury/TokenHoldings'

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
]

export const TotalTokenHoldingsSection = () => (
  <div>
    <HeaderTitle className="mb-4">Total token holdings</HeaderTitle>
    <Table data={tableData} />
  </div>
)
