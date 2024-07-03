import { Header } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { RenderTotalBalance } from '@/app/user/Balances/RenderTotalBalance'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'

const data = [
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: 'RIF',
    tokenPrice: <RenderTokenPrice symbol="RIF" />,
    totalBalance: <RenderTotalBalance symbol="RIF" />,
    actions: <p>Stake</p>,
  },
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: 'stRIF',
    tokenPrice: <RenderTokenPrice symbol="stRIF" />,
    totalBalance: <RenderTotalBalance symbol="stRIF" />,
    actions: <p>Unstake</p>,
  },
  {
    token: 'Rootstock Bitcoin',
    symbol: 'rBTC',
    tokenPrice: <RenderTokenPrice symbol="RBTC" />,
    totalBalance: <RenderTotalBalance symbol="RBTC" />,
    actions: '',
  },
]

export const BalancesSection = () => {
  return (
    <div className="mb-[32px]">
      <Header variant="h2" className="mb-[32px]">
        Balances
      </Header>
      <BalancesProvider>
        <Table data={data} />
      </BalancesProvider>
    </div>
  )
}
