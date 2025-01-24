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
import { withBuilderButton } from '@/app/collective-rewards/user'
import { useVoteCastEvent } from '@/app/proposals/hooks/useVoteCastEvent'
import { useAccount } from 'wagmi'

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

interface BalancesSectionProps {
  showBuilderButton?: boolean
}

export const BalancesSection = ({ showBuilderButton }: BalancesSectionProps) => {
  const { address } = useAccount()
  const { data: events } = useVoteCastEvent('0x81Df35317DF983e419630908eF6CB2BB48cE21Ca')

  console.log('BALANCES SECTION EVENTS', events)

  return (
    <div className="mb-[32px]">
      {showBuilderButton ? (
        withBuilderButton(HeaderTitle)({
          children: (
            <div>
              <text>Balances </text>
              {address ? <text>{`(Your Address Voted ${events?.length || 0} times)`}</text> : null}
            </div>
          ),
        })
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
