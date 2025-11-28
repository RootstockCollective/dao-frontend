import { useMemo } from 'react'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SwappingToken } from './types'
import { USDRIF, USDRIF_ADDRESS } from '@/lib/constants'
// TODO: After dao-1767 merge, import USDT0 and USDT0_ADDRESS:
// import { USDT0, USDT0_ADDRESS } from '@/lib/constants'
import { SwappingStepWrapper } from './components/SwappingStepWrapper'

// Assuming SwappingProvider exists in dao-1767 branch
// import { SwappingProvider } from '@/shared/context/SwappingContext'

// Temporary constants matching dao-1767 - will be replaced with imports after merge
// Matching dao-1767 structure: USDT0 -> USDRIF (tokenIn -> tokenOut)
const USDT0 = 'USDT0' as const
// TODO: Replace with USDT0_ADDRESS import after dao-1767 merge
const USDT0_ADDRESS = '0x0000000000000000000000000000000000000000' as const

interface Props {
  onCloseModal: () => void
}

export const SwappingFlow = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()

  // Matching dao-1767 order: USDT0 (tokenIn/tokenToSend) -> USDRIF (tokenOut/tokenToReceive)
  const tokenToSend: SwappingToken = useMemo(
    () => ({
      balance: '0', // TODO: Get from balances[USDT0]?.balance when USDT0 is added to balances
      symbol: USDT0,
      contract: USDT0_ADDRESS,
      price: prices[USDT0]?.price.toString(),
    }),
    [prices],
  )

  const tokenToReceive: SwappingToken = useMemo(
    () => ({
      balance: balances[USDRIF]?.balance || '0',
      symbol: USDRIF,
      contract: USDRIF_ADDRESS,
      price: prices[USDRIF]?.price.toString(),
    }),
    [balances, prices],
  )

  // TODO: Uncomment when SwappingProvider is merged from dao-1767
  // return (
  //   <SwappingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
  //     <SwappingStepWrapper onCloseModal={onCloseModal} />
  //   </SwappingProvider>
  // )

  // Temporary: Direct render until SwappingProvider is available
  return <SwappingStepWrapper onCloseModal={onCloseModal} />
}
