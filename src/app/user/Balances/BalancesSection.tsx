import { Header } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { RenderTotalBalance } from '@/app/user/Balances/RenderTotalBalance'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'
import { StakingModal } from '@/app/user/Stake/StakingSteps'
import { StakeRIFCell } from '@/app/user/Balances/StakeRIFCell'
import { RenderTokenSymbol } from '@/app/user/Balances/RenderTokenSymbol'
import { UnStakeRIFCell } from '@/app/user/Balances/UnStakeRIFCell'
import { UnStakingModal } from '@/app/user/Stake/UnStakingSteps'

const data = [
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: <RenderTokenSymbol symbol="RIF" />,
    'Token Price': <RenderTokenPrice symbol="RIF" />,
    'Total Balance': <RenderTotalBalance symbol="RIF" />,
    actions: <StakeRIFCell />,
  },
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: <RenderTokenSymbol symbol="stRIF" />,
    'Token Price': <RenderTokenPrice symbol="stRIF" />,
    'Total Balance': <RenderTotalBalance symbol="stRIF" />,
    actions: <UnStakeRIFCell />,
  },
  {
    token: 'Rootstock Bitcoin',
    symbol: <RenderTokenSymbol symbol="RBTC" />,
    'Token Price': <RenderTokenPrice symbol="RBTC" />,
    'Total Balance': <RenderTotalBalance symbol="RBTC" />,
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
        <StakingModal />
        <UnStakingModal />
        <Table data={data} />
      </BalancesProvider>
    </div>
  )
}
