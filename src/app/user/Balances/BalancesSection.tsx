import { BalanceInfoForUser } from '@/app/user/Balances/BalanceInfoForUser'
import { StakingFlow } from '@/app/user/Stake'
import { UnstakeModal } from '@/app/user/Unstake'
import { useModal } from '@/shared/hooks/useModal'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ButtonNew'
import { MoneyIconKoto } from '@/components/Icons'

export const BalancesSection = () => {
  const isUserBuilder = false // @TODO
  const stakeModal = useModal()
  const unstakeModal = useModal()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const [hasOpenedStakeModal, setHasOpenedStakeModal] = useState(false)

  useEffect(() => {
    if (action === 'stake' && !hasOpenedStakeModal) {
      stakeModal.openModal()
      setHasOpenedStakeModal(true)
    }
  }, [action, hasOpenedStakeModal, stakeModal])

  const balancesText = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'
  return (
    <div className="mb-[32px]">
      <SectionContainer title={balancesText}>
        {isUserBuilder && (
          <p>
            Placehloder for TOK {/* @TODO */} <hr />
          </p>
        )}
        <div className="flex flex-row justify-between mb-6">
          <div className="flex flex-col gap-4">
            <BalanceInfoForUser symbol="RIF" />
            <StakeButton onClick={stakeModal.openModal} />
          </div>
          <div className="flex flex-col gap-4">
            <BalanceInfoForUser symbol="stRIF" />
            <UnstakeButton onClick={unstakeModal.openModal} />
          </div>
          {/*<BalanceInfoForUser symbol="USDRIF" /> @TODO de-scoped for now due to not fetching prices */}
          <BalanceInfoForUser symbol="RBTC" />
          <div /> {/* @TODO empty div to occupy space - remove when USDRIF is implemented */}
        </div>
        <div>
          {stakeModal.isModalOpened && <StakingFlow onCloseModal={stakeModal.closeModal} />}
          {unstakeModal.isModalOpened && <UnstakeModal onCloseModal={unstakeModal.closeModal} />}
        </div>
      </SectionContainer>
    </div>
  )
}

const StakeButton = ({ onClick }: { onClick: () => void }) => {
  const { isConnected } = useAccount()
  const { balances } = useBalancesContext()
  const { balance } = balances['RIF']
  const hasEnoughBalance = Number(balance) > 0
  return (
    <Button
      onClick={hasEnoughBalance ? onClick : undefined}
      disabled={!hasEnoughBalance}
      data-testid="StakeRIF"
      variant="secondary-outline"
    >
      Stake RIF{/* TODO dynamic symbol here */}
    </Button>
  )
}

const UnstakeButton = ({ onClick }: { onClick: () => void }) => {
  const { isConnected } = useAccount()
  const { balances } = useBalancesContext()
  const { balance } = balances['stRIF']
  const hasEnoughBalance = Number(balance) > 0
  return (
    <Button
      onClick={hasEnoughBalance ? onClick : undefined}
      disabled={!hasEnoughBalance}
      data-testid="UnstakeRIF"
      className="flex flex-row gap-2 pl-0"
      variant="transparent"
    >
      <span>Unstake stRIF</span>
      <MoneyIconKoto />
    </Button>
  )
}
