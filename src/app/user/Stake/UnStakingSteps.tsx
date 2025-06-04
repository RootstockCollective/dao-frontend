import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'
import { Modal } from '@/components/Modal'
import { StepOne } from './Steps/StepOne'

interface Props {
  onCloseModal: () => void
}

export const UnStakingSteps = ({ onCloseModal }: Props) => {
  const { onGoNext, onGoBack } = useSteps(1)
  const { balances, prices } = useBalancesContext()

  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: tokenContracts.stRIF,
      price: prices.stRIF?.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF?.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: tokenContracts.RIF,
      price: prices.RIF?.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF?.price],
  )

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <Modal width={688} onClose={onCloseModal}>
        <StepOne {...stepsFunctions} />
      </Modal>
    </StakingProvider>
  )
}
