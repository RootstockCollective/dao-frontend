import { SwappingProvider } from '@/shared/context/SwappingContext/SwappingProvider'
import { SwappingStepWrapper } from './components/SwappingStepWrapper'

interface Props {
  onCloseModal: () => void
}

export const SwappingFlow = ({ onCloseModal }: Props) => {
  return (
    <SwappingProvider>
      <SwappingStepWrapper onCloseModal={onCloseModal} />
    </SwappingProvider>
  )
}
