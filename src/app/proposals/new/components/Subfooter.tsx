'use client'

import { Button } from '@/components/ButtonNew'
import { motion } from 'motion/react'
import { useRouter, usePathname } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useState, useCallback, useEffect } from 'react'
import { LeavingProposalModal } from './LeavingProposalModal'
import { useNavigationGuard } from 'next-navigation-guard'

interface Props {
  submitForm: () => void
  buttonText: string
  disabled?: boolean
  nextDisabled?: boolean
  backDisabled?: boolean
}

export const Subfooter = ({
  submitForm,
  disabled = false,
  nextDisabled = false,
  backDisabled = false,
  buttonText,
}: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isSidebarOpen } = useLayoutContext()
  const isDesktop = useIsDesktop()

  const [showModal, setShowModal] = useState(false)
  const [isBackPressed, setIsBackPressed] = useState(false)

  const { active, accept, reject } = useNavigationGuard({
    enabled: true,
  })

  useEffect(() => {
    if (active && isBackPressed && pathname.startsWith('/proposals/new/details')) {
      setShowModal(true)
    }
    // If the active state is true but we are not on the guarded page, we accept navigation
    else if (active && !pathname.startsWith('/proposals/new/details')) {
      accept()
    }
  }, [active, isBackPressed, accept, pathname])

  // --- Modal Button Handlers ---

  const handleProceedWithExit = useCallback(() => {
    setShowModal(false)
    accept()
  }, [accept])

  const handleStayOnPage = useCallback(() => {
    setShowModal(false)
    reject()
  }, [reject])

  const handleBack = useCallback(() => {
    setIsBackPressed(true)
    router.back()
  }, [router])

  const handleNext = () => {
    setIsBackPressed(false)
    accept()
    submitForm()
  }

  if (!isDesktop && isSidebarOpen) return null

  return (
    <motion.div
      initial={{ y: 96 }}
      animate={{ y: 0 }}
      exit={{ y: 96 }}
      transition={{ ease: 'easeOut', duration: 0.3 }}
      className="sticky bottom-0 z-40"
    >
      <div className="h-[96px] flex items-center justify-center gap-2 bg-bg-60">
        <Button disabled={backDisabled || disabled} onClick={handleBack} variant="secondary-outline">
          Back
        </Button>
        <Button disabled={nextDisabled || disabled} onClick={handleNext}>
          {buttonText}
        </Button>
      </div>

      {showModal && (
        <LeavingProposalModal onStay={handleStayOnPage} onProceedWithExit={handleProceedWithExit} />
      )}
    </motion.div>
  )
}
