import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { Modal } from '@/components/Modal'
import { StepOne, StepThree, StepTwo } from './Steps'

interface Props {
  onCloseModal: () => void
}

const StakingComponents = [StepOne, StepTwo, StepThree]

export const StakingSteps = ({ onCloseModal }: Props) => {
  const { step, ...stepFunctions } = useSteps(3)
  const { balances, prices } = useBalancesContext()

  const CurrentStep = useMemo(() => StakingComponents[step], [step])

  const stakingHandlers = { ...stepFunctions, onCloseModal }

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: tokenContracts.RIF,
      price: prices.RIF?.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF?.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: tokenContracts.stRIF,
      price: prices.stRIF?.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF?.price],
  )
  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <Modal width={688} onClose={onCloseModal}>
        <CurrentStep {...stakingHandlers} actionName="STAKE" />
      </Modal>
    </StakingProvider>
  )
}
