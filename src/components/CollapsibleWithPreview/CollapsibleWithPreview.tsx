'use client'

import { cn } from '@/lib/utils/utils'
import { ChevronDownIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const PADDING = 32 // 16px * 2 for m-4 padding

interface CollapsibleStateColors {
  backgroundColor: string
  chevronColor: string
}

interface CollapsibleWithPreviewProps {
  expandedContent: React.ReactNode
  collapsedContent: React.ReactNode
  expandedState: CollapsibleStateColors
  collapsedState?: CollapsibleStateColors
  defaultOpen?: boolean
  onStateChange?: (isOpen: boolean) => void
  className?: string
}

const CollapsibleWithPreview: React.FC<CollapsibleWithPreviewProps> = ({
  expandedContent,
  collapsedContent,
  expandedState,
  collapsedState,
  defaultOpen = true,
  onStateChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [expandedHeight, setExpandedHeight] = useState<number>(0)
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const expandedContentRef = useRef<HTMLDivElement>(null)
  const collapsedContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expandedContentRef.current || !collapsedContentRef.current) return

    // Track content height changes to ensure proper container sizing
    const expandedObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setExpandedHeight(entry.contentRect.height + PADDING)
      }
    })

    const collapsedObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setCollapsedHeight(entry.contentRect.height + PADDING) // Add padding (m-4 = 16px * 2)
      }
    })

    expandedObserver.observe(expandedContentRef.current)
    collapsedObserver.observe(collapsedContentRef.current)

    return () => {
      expandedObserver.disconnect()
      collapsedObserver.disconnect()
    }
  }, [])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onStateChange?.(newState)
  }

  const currentState = isOpen ? expandedState : (collapsedState ?? expandedState)
  const chevronRotation = isOpen ? 'rotate-180' : 'rotate-0'
  const containerHeight = isOpen ? expandedHeight : collapsedHeight

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded w-full font-rootstock-sans overflow-hidden transition-all duration-300 ease-in-out',
        currentState.backgroundColor,
        className,
      )}
      style={{
        height: containerHeight,
      }}
    >
      <div className="absolute top-4 right-4 cursor-pointer z-10">
        <ChevronDownIcon
          className={cn(
            'w-6 h-6 transition-all duration-300 ease-in-out',
            currentState.chevronColor,
            chevronRotation,
          )}
          onClick={handleToggle}
        />
      </div>
      <div
        className={`relative m-4 flex flex-col overflow-hidden w-[calc(100%-${PADDING}px)] h-[calc(100%-${PADDING}px)]`}
      >
        <div ref={expandedContentRef} className={isOpen ? 'block' : 'hidden'}>
          {expandedContent}
        </div>
        <div ref={collapsedContentRef} className={isOpen ? 'hidden' : 'block'}>
          {collapsedContent}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleWithPreview
