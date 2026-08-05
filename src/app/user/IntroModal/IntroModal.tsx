import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { RBTC, RIF } from '@/lib/constants'

import { useBalancesContext } from '../Balances/context/BalancesContext'
import { useIntroDismissal } from './hooks/useIntroDismissal'
import { useIntroSteps } from './hooks/useIntroSteps'
import { useStakingRequirements } from './hooks/useStakingRequirements'
import { IntroModalContent } from './IntroModalContent'

export const IntroModal = () => {
  const { needsRif, needsGas, needsStRif, minGas, isReady } = useStakingRequirements()
  const { isHidden, dismiss, closeForSession } = useIntroDismissal()

  const hasSomethingToDo = needsRif || needsGas || needsStRif

  // Everything the wizard freezes on mount has to be settled first, hence the guard rather
  // than rendering it and letting it re-derive: `isHidden` is null until storage has been
  // read, and `isReady` is false until balances and the gas threshold resolve. Mounting early
  // would freeze a step list built from values we did not have yet.
  if (!isReady || isHidden !== false || !hasSomethingToDo) {
    return null
  }

  return (
    <IntroWizard
      needsRif={needsRif}
      needsGas={needsGas}
      minGas={minGas}
      onDismiss={dismiss}
      onClose={closeForSession}
    />
  )
}

interface IntroWizardProps {
  needsRif: boolean
  needsGas: boolean
  minGas: string
  onDismiss: () => void
  onClose: () => void
}

/**
 * Separate component so `useIntroSteps` mounts exactly once, with the balances the user had
 * when the modal opened. Its step list is frozen from then on.
 */
const IntroWizard = ({ needsRif, needsGas, minGas, onDismiss, onClose }: IntroWizardProps) => {
  const wizard = useIntroSteps({ needsRif, needsGas })
  const { balances, isBalancesFetching, refetchBalances } = useBalancesContext()
  const { address } = useAccount()
  const router = useRouter()

  // The whole flow sends people to a provider in another tab, so coming back is the single
  // best signal that funds may have landed. The app disables react-query's window-focus
  // refetch globally, and the balance polls run on a block-time interval that is far too slow
  // for someone standing in front of this screen — so ask again the moment they return.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchBalances()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refetchBalances])

  // Opening a provider must not advance the step or close the modal: the user is coming back.
  const handleOpenProvider = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

  // Navigating is enough — the page hides this modal while `action=stake`, and once the user
  // actually stakes there is nothing left to onboard. Deliberately not a dismissal: that is
  // reserved for the user explicitly opting out, so abandoning the staking flow does not
  // silently cost them the onboarding.
  const handleStake = () => router.push('/user?action=stake')

  return (
    <IntroModalContent
      wizard={wizard}
      address={address}
      rifBalance={balances[RIF].balance}
      rbtcBalance={balances[RBTC].balance}
      needsRif={needsRif}
      needsGas={needsGas}
      minGas={minGas}
      isRefreshing={isBalancesFetching}
      onRefresh={refetchBalances}
      onOpenProvider={handleOpenProvider}
      onSkip={onDismiss}
      onStake={handleStake}
      onClose={onClose}
    />
  )
}
