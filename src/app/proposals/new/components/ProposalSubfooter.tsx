'use client'

import { Button } from '@/components/ButtonNew'
import { useRouter, usePathname } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useState, useCallback, useEffect, useRef } from 'react'
import { LeavingProposalModal } from './LeavingProposalModal'
import { ActionsContainer } from '@/components/containers/ActionsContainer'

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
  const pageToStayOnRef = useRef<string | null>(null)

  const lastCommittedPathRef = useRef(pathname)

  if (lastCommittedPathRef.current !== pathname) {
    // Conditional update
    lastCommittedPathRef.current = pathname
  }

  const shouldIntercept = useCallback((currentUrl: string, prevUrl: string | null): boolean => {
    return currentUrl.startsWith('/proposals/new/details') && prevUrl === '/proposals/new'
  }, [])

  const handleSubfooterBackClick = useCallback(() => {
    const wouldGoToNew = '/proposals/new'

    // Use current pathname as the 'from' path
    if (shouldIntercept(pathname, wouldGoToNew)) {
      setShowModal(true)

      pageToStayOnRef.current = pathname
    } else {
      router.back()
    }
  }, [pathname, router, shouldIntercept])

  // --- Browser Back Button (popstate) Interception ---
  useEffect(() => {
    const handlePopState = () => {
      const currentBrowserPath = window.location.pathname
      const pathBeforePop = lastCommittedPathRef.current

      if (shouldIntercept(pathBeforePop, currentBrowserPath) && !showModal) {
        window.history.pushState(
          { intercepted: true, originalPath: pathBeforePop },
          '',
          pathBeforePop || window.location.href,
        )

        setShowModal(true)
        pageToStayOnRef.current = pathBeforePop
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [showModal, shouldIntercept])

  // --- Modal Button Handlers ---

  // "Cancel proposal" (white button): User confirms leaving, proceed to '/proposals/new'
  const handleProceedWithExit = useCallback(() => {
    setShowModal(false)
    router.push('/proposals/new') // Navigate to /proposals/new
    pageToStayOnRef.current = null // Clear
  }, [router])

  // "Take me back" (orange button / X): User cancels leaving, stay on the *details page*
  const handleStayOnPage = useCallback(() => {
    setShowModal(false)
    const targetStayPath = pageToStayOnRef.current // This holds the details page path from when modal triggered
    pageToStayOnRef.current = null

    if (targetStayPath && targetStayPath.startsWith('/proposals/new/details')) {
      router.replace(targetStayPath) // Replace current history entry to keep URL clean and correct
    } else {
      router.replace(window.location.pathname) // Fallback to current URL (shouldn't happen here)
    }
  }, [router])

  if (!isDesktop && isSidebarOpen) return null

  return (
    <>
      <ActionsContainer className="bg-bg-60" containerClassName="items-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={backDisabled || disabled}
            onClick={handleSubfooterBackClick}
            variant="secondary-outline"
          >
            Back
          </Button>
          <Button disabled={nextDisabled || disabled} onClick={submitForm}>
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
