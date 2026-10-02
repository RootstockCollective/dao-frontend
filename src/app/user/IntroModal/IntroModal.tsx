import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { RBTC, RIF } from '@/lib/constants'
import { useModal } from '@/shared/hooks/useModal'

import { useBalancesContext } from '../Balances/context/BalancesContext'
import { useIntroModalDismissal } from './hooks/useIntroModalDismissal'
import { useRequiredTokens } from './hooks/useRequiredTokens'
import { IntroModalContent } from './IntroModalContent'

export const IntroModal = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const tokenStatus = useRequiredTokens()
  const { isDismissed, dismiss } = useIntroModalDismissal()
  const { balances } = useBalancesContext()
  const router = useRouter()

  const handleClose = () => {
    if (tokenStatus) {
      dismiss(tokenStatus)
    }
    closeModal()
  }

  const handleContinue = (url: string, external = false) => {
    if (external) {
      // The holder leaves for a provider and comes back, so the modal stays open for them
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Heading to the staking flow answers the modal too: backing out of it must not bring the modal back
      handleClose()
      router.push(url)
    }
  }

  useEffect(() => {
    if (tokenStatus !== null && !isDismissed(tokenStatus)) {
      openModal()
    } else {
      closeModal()
    }
  }, [tokenStatus, isDismissed, openModal, closeModal])

  if (!tokenStatus || !isModalOpened) {
    return null
  }

  return (
    <IntroModalContent
      tokenStatus={tokenStatus}
      rbtcBalance={balances[RBTC].balance}
      rifBalance={balances[RIF].balance}
      onClose={handleClose}
      onContinue={handleContinue}
    />
  )
}
