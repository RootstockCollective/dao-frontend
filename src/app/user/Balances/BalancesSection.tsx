import { HeaderTitle, Paragraph } from '@/components/Typography'
import { Table } from '@/components/Table'
import { RenderTokenPrice } from '@/app/user/Balances/RenderTokenPrice'
import { RenderTotalBalance } from '@/app/user/Balances/RenderTotalBalance'
import { StakingSteps } from '@/app/user/Stake/StakingSteps'
import { StakeRIFCell } from '@/app/user/Balances/StakeRIFCell'
import { RenderTokenSymbol } from '@/app/user/Balances/RenderTokenSymbol'
import { UnStakeRIFCell } from '@/app/user/Balances/UnStakeRIFCell'
import { ModalReturn, useModal } from '@/shared/hooks/useModal'
import { UnStakingSteps } from '../Stake/UnStakingSteps'
import { Link } from '@/components/Link'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared'
import { SectionHeader } from '@/components/SectionHeader'

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
    <div className="mb-[32px]">
      {showTitle && (
        <SectionHeader
          name="Balances"
          description="Your tokens that can be used in the Collective are shown here together with summary total balances with the option to Stake your RIF."
        />
      )}
      {stakeModal.isModalOpened ? <StakingSteps onCloseModal={stakeModal.closeModal} /> : null}
      {unstakeModal.isModalOpened ? <UnStakingSteps onCloseModal={unstakeModal.closeModal} /> : null}
      <Table data={makeData(stakeModal, unstakeModal)} className="overflow-visible" />
    </div>
  )
}
