'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useState, useCallback, useEffect } from 'react'
import { LeavingProposalModal } from './LeavingProposalModal'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { useNavigationGuard } from 'next-navigation-guard'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'

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

  const { isModalOpened, openModal, closeModal } = useModal()
  const [isBackPressed, setIsBackPressed] = useState(false)

  const { active, accept, reject } = useNavigationGuard({
    enabled: isBackPressed && pathname.startsWith('/proposals/new/details'),
  })

  useEffect(() => {
    if (active) {
      openModal()
    }
  }, [active, openModal])

  useEffect(() => {
    const handlePopState = () => {
      setIsBackPressed(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname])

  // --- Modal Button Handlers ---

  const handleProceedWithExit = useCallback(() => {
    closeModal()
    accept()
  }, [accept, closeModal])

  const handleStayOnPage = useCallback(() => {
    closeModal()
    reject()
  }, [reject, closeModal])

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
      <div
        data-testid="ActionsContainer"
        className={cn(
          'flex flex-col w-full gap-4 md:gap-10 py-4 md:p-6 rounded-sm fixed bottom-0 left-0 right-0',
          isDesktop ? 'bg-bg-60' : 'bg-l-black',
        )}
      >
        <Divider className="md:hidden mx-4" />
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4 w-full md:w-auto px-4 md:px-0">
            <Button
              disabled={backDisabled || disabled}
              onClick={handleBack}
              variant="secondary-outline"
              className="w-auto px-12 md:px-3"
              data-testid="BackButton"
            >
              Back
            </Button>
            <Button
              disabled={nextDisabled || disabled}
              onClick={handleNext}
              className="flex-1"
              data-testid="ReviewProposalButton"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>

      {isModalOpened && (
        <LeavingProposalModal onStay={handleStayOnPage} onProceedWithExit={handleProceedWithExit} />
      )}
    </>
  )
}
