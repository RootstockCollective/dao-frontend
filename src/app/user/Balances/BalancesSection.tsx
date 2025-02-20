import { HeaderTitle } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { RenderTotalBalance } from '@/app/user/Balances/RenderTotalBalance'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'
import { StakingSteps } from '@/app/user/Stake/StakingSteps'
import { StakeRIFCell } from '@/app/user/Balances/StakeRIFCell'
import { RenderTokenSymbol } from '@/app/user/Balances/RenderTokenSymbol'
import { UnStakeRIFCell } from '@/app/user/Balances/UnStakeRIFCell'
import { ModalReturn, useModal } from '@/shared/hooks/useModal'
import { UnStakingSteps } from '../Stake/UnStakingSteps'

const makeData = (stakeModal: ModalReturn, unstakeModal: ModalReturn) => [
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: <RenderTokenSymbol symbol="RIF" />,
    'Token Price': <RenderTokenPrice symbol="RIF" />,
    'Total Balance': <RenderTotalBalance symbol="RIF" />,
    actions: <StakeRIFCell stakeModal={stakeModal} />,
  },
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: <RenderTokenSymbol symbol="stRIF" />,
    'Token Price': <RenderTokenPrice symbol="stRIF" />,
    'Total Balance': <RenderTotalBalance symbol="stRIF" />,
    actions: <UnStakeRIFCell unstakeModal={unstakeModal} />,
  },
  {
    token: 'Rootstock Bitcoin',
    symbol: <RenderTokenSymbol symbol="RBTC" />,
    'Token Price': <RenderTokenPrice symbol="RBTC" />,
    'Total Balance': <RenderTotalBalance symbol="RBTC" />,
    actions: '',
  },
]

interface Props {
  showTitle?: boolean
}
export const BalancesSection = ({ showTitle = false }: Props) => {
  const stakeModal = useModal()
  const unstakeModal = useModal()

  return (
    <BalancesProvider>
      <div className="mb-[32px]">
        {showTitle ? <HeaderTitle className="mb-6">Balances</HeaderTitle> : null}
        {stakeModal.isModalOpened ? <StakingSteps onCloseModal={stakeModal.closeModal} /> : null}
        {unstakeModal.isModalOpened ? <UnStakingSteps onCloseModal={unstakeModal.closeModal} /> : null}
        <Table data={makeData(stakeModal, unstakeModal)} />
      </div>
    </BalancesProvider>
  )
}
