'use client'

import { Button } from '@/components/ButtonNew'
import { motion } from 'motion/react'
import { useRouter, usePathname } from 'next/navigation' // Import usePathname
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useState, useCallback, useEffect, useRef } from 'react'
import { LeavingProposalModal } from './LeavingProposalModal'

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
      console.log("[Subfooter] 'Back' button clicked on details page, showing modal.")
    } else {
      router.back()
      console.log("[Subfooter] 'Back' button clicked, performing regular router.back().")
    }
  }, [pathname, router, shouldIntercept])

  // --- Browser Back Button (popstate) Interception ---
  useEffect(() => {
    const handlePopState = () => {
      const currentBrowserPath = window.location.pathname
      const pathBeforePop = lastCommittedPathRef.current

      console.log(`[Popstate Event Fired!] New: ${currentBrowserPath}, Before: ${pathBeforePop}`)

      if (shouldIntercept(pathBeforePop, currentBrowserPath) && !showModal) {
        console.log('[Detector] Browser back from details detected! Actively Intercepting.')

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
    console.log('[Popstate Listener] Added.')

    return () => {
      window.removeEventListener('popstate', handlePopState)
      console.log('[Popstate Listener] Removed.')
    }
  }, [showModal, shouldIntercept])

  // --- Modal Button Handlers (Now within Subfooter) ---

  // "Cancel proposal" (white button): User confirms leaving, proceed to '/proposals/new'
  const handleProceedWithExit = useCallback(() => {
    setShowModal(false)
    router.push('/proposals/new') // Navigate to /proposals/new
    pageToStayOnRef.current = null // Clear
    console.log('[Modal Action] Proceeding with exit to /proposals/new.')
  }, [router])

  // "Take me back" (orange button / X): User cancels leaving, stay on the *details page*
  const handleStayOnPage = useCallback(() => {
    setShowModal(false)
    const targetStayPath = pageToStayOnRef.current // This holds the details page path from when modal triggered
    pageToStayOnRef.current = null

    if (targetStayPath && targetStayPath.startsWith('/proposals/new/details')) {
      router.replace(targetStayPath) // Replace current history entry to keep URL clean and correct
      console.log(`[Modal Action] Staying on original details page: ${targetStayPath}`)
    } else {
      router.replace(window.location.pathname) // Fallback to current URL (shouldn't happen here)
      console.log(`[Modal Action] Fallback: Staying on current URL: ${window.location.pathname}`)
    }
  }, [router])

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
        <Button
          disabled={backDisabled || disabled}
          onClick={handleSubfooterBackClick} // Custom handler
          variant="secondary-outline"
        >
          Back
        </Button>
        <Button disabled={nextDisabled || disabled} onClick={submitForm}>
          {buttonText}
        </Button>
      </div>

      {showModal && (
        <LeavingProposalModal onStay={handleStayOnPage} onProceedWithExit={handleProceedWithExit} />
      )}
    </motion.div>
  )
}
