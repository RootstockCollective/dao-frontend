'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useState, useCallback, useEffect } from 'react'
import { LeavingProposalModal } from './LeavingProposalModal'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Button } from '@/components/Button'
import { useNavigationGuard } from 'next-navigation-guard'

interface Props {
  submitForm: () => void
  buttonText: string
  disabled?: boolean
  nextDisabled?: boolean
  backDisabled?: boolean
}

export const ProposalSubfooter = ({
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
    enabled: isBackPressed && pathname.startsWith('/proposals/new/details'),
  })

  useEffect(() => {
    if (active) {
      setShowModal(true)
    }
  }, [active])

  useEffect(() => {
    const handlePopState = () => {
      setIsBackPressed(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname])

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
    <>
      <ActionsContainer className="bg-bg-60" containerClassName="items-center">
        <div className="flex items-center justify-center gap-2">
          <Button disabled={backDisabled || disabled} onClick={handleBack} variant="secondary-outline">
            Back
          </Button>
          <Button disabled={nextDisabled || disabled} onClick={handleNext}>
            {buttonText}
          </Button>
        </div>
      </ActionsContainer>

      {showModal && (
        <LeavingProposalModal onStay={handleStayOnPage} onProceedWithExit={handleProceedWithExit} />
      )}
    </>
  )
}
