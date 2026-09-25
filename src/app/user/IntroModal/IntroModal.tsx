import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { RBTC, RIF } from '@/lib/constants'
import { useModal } from '@/shared/hooks/useModal'

import { useBalancesContext } from '../Balances/context/BalancesContext'
import { useRequiredTokens } from './hooks/useRequiredTokens'
import { IntroModalContent } from './IntroModalContent'

export const IntroModal = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const tokenStatus = useRequiredTokens()
  const { balances } = useBalancesContext()
  const router = useRouter()

  const handleContinue = (url: string, external = false) => {
    if (external) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(url)
      closeModal()
    }
  }

  useEffect(() => {
    if (tokenStatus !== null) {
      openModal()
    } else {
      closeModal()
    }
  }, [tokenStatus, openModal, closeModal])

  if (!tokenStatus || !isModalOpened) {
    return null
  }

  return (
    <IntroModalContent
      tokenStatus={tokenStatus}
      rbtcBalance={balances[RBTC].balance}
      rifBalance={balances[RIF].balance}
      onClose={closeModal}
      onContinue={handleContinue}
    />
  )
}
