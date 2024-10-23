import { HeaderTitle } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { RenderTotalBalance } from '@/app/user/Balances/RenderTotalBalance'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'
import { StakingModal } from '@/app/user/Stake/StakingSteps'
import { StakeRIFCell } from '@/app/user/Balances/StakeRIFCell'
import { RenderTokenSymbol } from '@/app/user/Balances/RenderTokenSymbol'
import { UnStakeRIFCell } from '@/app/user/Balances/UnStakeRIFCell'
import { UnStakingModal } from '@/app/user/Stake/UnStakingSteps'
import { WithBuilderButton } from '@/app/collective-rewards/WithBuilderButton'

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

const HeaderWithBuilderButton = WithBuilderButton(HeaderTitle)

type BalancesSectionProps = {
  showBuilderButton?: boolean
}

export const BalancesSection = ({ showBuilderButton = false }: BalancesSectionProps) => {
  return (
    <div className="mb-[32px]">
      {showBuilderButton ? (
        <HeaderWithBuilderButton>Balances</HeaderWithBuilderButton>
      ) : (
        <HeaderTitle className="mb-6">Balances</HeaderTitle>
      )}
      <BalancesProvider>
        <StakingModal />
        <UnStakingModal />
        <Table data={data} />
      </BalancesProvider>
    </div>
  )
}
