import { BalanceInfoForUser } from '@/app/user/Balances/BalanceInfoForUser'
import { StakingFlow } from '@/app/user/Stake'
import { UnstakeModal } from '@/app/user/Unstake'
import { useModal } from '@/shared/hooks/useModal'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/ButtonNew'
import { MoneyIconKoto } from '@/components/Icons'
import { useRef } from 'react'
import { Span } from '@/components/TypographyNew'

export const BalancesSection = () => {
  const isUserBuilder = false // @TODO
  const stakeModal = useModal()
  const unstakeModal = useModal()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const shouldReopen = searchParams.get('reopen') // ID number
  const [hasOpenedStakeModal, setHasOpenedStakeModal] = useState(false)
  const reopenId = useRef('0')

  useEffect(() => {
    if (action === 'stake' && !hasOpenedStakeModal && !shouldReopen) {
      stakeModal.openModal()
      setHasOpenedStakeModal(true)
    }
    if (action === 'stake' && shouldReopen && shouldReopen !== reopenId.current) {
      stakeModal.openModal()
      setHasOpenedStakeModal(true)
      reopenId.current = shouldReopen
    }
  }, [action, hasOpenedStakeModal, shouldReopen, stakeModal])

  const balancesText = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'
  return (
    <SectionContainer title={balancesText} headerVariant="h3">
      {isUserBuilder && (
        <>
          <p className="mb-4">Placehloder for TOK {/* @TODO */}</p>
          <hr className="w-full bg-bg-60 border-none h-px my-10" />
        </>
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
        <BalanceInfoForUser symbol="USDRIF" />
        <BalanceInfoForUser symbol="RBTC" />
      </div>
      <div>
        {stakeModal.isModalOpened && <StakingFlow onCloseModal={stakeModal.closeModal} />}
        {unstakeModal.isModalOpened && <UnstakeModal onCloseModal={unstakeModal.closeModal} />}
      </div>
    </SectionContainer>
  )
}

const StakeButton = ({ onClick }: { onClick: () => void }) => {
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
      <Span>Unstake stRIF</Span>
      <MoneyIconKoto />
    </Button>
  )
}
