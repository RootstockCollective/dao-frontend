'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { CloseIconKoto } from '../Icons'
import { PortalContainerContext } from '../PortalContainerContext'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  children: ReactNode
  onClose: () => void
  className?: string
  width?: number
  height?: number | 'auto'
  closeButtonColor?: 'white' | 'black'
  /**
   * Called when Escape is pressed. Opt-in: without it, Escape does nothing, so modals that
   * must not be dismissed mid-transaction keep their current behaviour.
   */
  onEscape?: () => void
  /**
   * Keep Tab focus inside the modal and restore it to the trigger on unmount. Opt-in, and it
   * also gives the panel proper `dialog` semantics.
   */
  trapFocus?: boolean
  /** Accessible name for the dialog. Only meaningful together with `trapFocus`. */
  ariaLabel?: string
  'data-testid'?: string
}

/**
 * Modal component that wraps the content of the modal and provides a close button.
 * On mobile, the modal is always fullscreen.
 */
export const Modal = ({
  children,
  onClose,
  className,
  width,
  height = 'auto',
  closeButtonColor = 'white',
  onEscape,
  trapFocus = false,
  ariaLabel,
  'data-testid': dataTestId,
}: ModalProps) => {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const containerStyle: React.CSSProperties = {}

  const fullscreen = !useIsDesktop()

  if (!fullscreen && width) {
    containerStyle.width = `${width}px`
    containerStyle.maxWidth = '95vw'
  }

  if (!fullscreen && height !== 'auto' && typeof height === 'number') {
    containerStyle.height = `${height}px`
  }

  useEffect(() => {
    if (!onEscape && !trapFocus) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }

      if (!trapFocus || event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      // Wrap around at both ends so Tab can never walk out to the page behind the modal.
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, trapFocus])

  useEffect(() => {
    if (!trapFocus) {
      return
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    // Hand focus back to whatever opened the modal, so keyboard users do not restart at the
    // top of the page.
    return () => previouslyFocused?.focus?.()
  }, [trapFocus])

  return createPortal(
    <div
      ref={portalContainerRef}
      className={cn(
        'fixed inset-0 flex items-center justify-center z-modal max-w-screen max-h-dvh overflow-hidden',
        fullscreen ? '' : 'p-4',
      )}
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bg-100/50 backdrop-blur-xs max-w-screen max-h-dvh overflow-hidden" />

      <div
        ref={panelRef}
        className={cn(
          'relative overflow-x-hidden bg-bg-80 rounded overflow-y-auto min-w-0 touch-pan-y',
          'shadow-[0px_0px_40px_0px_rgba(255,255,255,0.10)]',
          fullscreen ? 'w-screen h-dvh' : 'w-[95vw] max-w-[380px] md:w-[688px] md:max-w-[97vw]',
          height === 'auto' && !fullscreen ? 'h-full md:h-auto' : '',
          className,
        )}
        style={containerStyle}
        // Dialog semantics only when focus is trapped, so the 18 existing call sites are
        // announced exactly as they are today.
        {...(trapFocus && { role: 'dialog', 'aria-modal': true, 'aria-label': ariaLabel, tabIndex: -1 })}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-base" data-testid="CloseButton">
          <CloseIconKoto size={24} aria-label="Close" color={closeButtonColor} />
        </button>

        <PortalContainerContext.Provider value={portalContainerRef}>
          {children}
        </PortalContainerContext.Provider>
      </div>
    </div>,
    document.body,
  )
}
