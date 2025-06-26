import { useImagePreloader } from '@/shared/hooks/useImagePreloader'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useModal } from '@/shared/hooks/useModal'
import { useEffect, useMemo } from 'react'
import { useBalancesContext } from '../Balances/context/BalancesContext'
import { IMAGE_CONFIG } from './config'
import { useRequiredTokens } from './hooks/useRequiredTokens'
import { useRouter } from 'next/navigation'
import { IntroModalContent } from './IntroModalContent'

export const IntroModal = () => {
  const introModal = useModal()
  const isDesktop = useIsDesktop()
  const tokenStatus = useRequiredTokens()
  const { balances } = useBalancesContext()
  const router = useRouter()

  // Get image paths for current status
  const imagePaths = useMemo(() => {
    if (!tokenStatus) return []

    const currentConfig = IMAGE_CONFIG[tokenStatus]
    return [
      currentConfig.desktop.bg,
      currentConfig.desktop.squares,
      currentConfig.mobile.bg,
      currentConfig.mobile.squares,
    ]
  }, [tokenStatus])

  // Preload images using preload hook
  const { isLoaded } = useImagePreloader(imagePaths)

  const handleContinue = (url: string, external = false) => {
    if (external) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(url)
      introModal.closeModal()
    }
  }

  useEffect(() => {
    if (isLoaded && tokenStatus !== null) {
      introModal.openModal()
    } else if (tokenStatus === null) {
      introModal.closeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, tokenStatus])

  // Don't render if no required tokens or loading is not complete
  if (!tokenStatus || !isLoaded || !introModal.isModalOpened) {
    return null
  }

  return (
    <IntroModalContent
      tokenStatus={tokenStatus}
      isDesktop={isDesktop}
      rbtcBalance={balances.RBTC.balance}
      rifBalance={balances.RIF.balance}
      onClose={introModal.closeModal}
      onContinue={handleContinue}
    />
  )
}
