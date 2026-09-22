import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { RBTC, RIF } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'
import { useModal } from '@/shared/hooks/useModal'

import { useBalancesContext } from '../Balances/context/BalancesContext'
import { useRequiredTokens } from './hooks/useRequiredTokens'
import { IntroModalContent } from './IntroModalContent'

const TOKEN_MARKS = [TOKENS.rbtc.icon, TOKENS.rif.icon]

export const IntroModal = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const tokenStatus = useRequiredTokens()
  const { balances } = useBalancesContext()
  const router = useRouter()

  const { isLoaded } = useImagePreloader(TOKEN_MARKS)

  const handleContinue = (url: string, external = false) => {
    if (external) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(url)
      closeModal()
    }
  }

  useEffect(() => {
    if (isLoaded && tokenStatus !== null) {
      openModal()
    } else if (tokenStatus === null) {
      closeModal()
    }
  }, [isLoaded, tokenStatus, openModal, closeModal])

  // Don't render if no required tokens or loading is not complete
  if (!tokenStatus || !isLoaded || !isModalOpened) {
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
