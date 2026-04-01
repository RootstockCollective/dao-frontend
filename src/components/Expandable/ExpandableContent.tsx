'use client'
import { cn } from '@/lib/utils'
import React, { FC, ReactNode, isValidElement } from 'react'
import { useExpandableContext } from './ExpandableContext'
import { Paragraph } from '../Typography'

// Expandable content section
interface Props {
  children: ReactNode
  className?: string
  contentClassName?: string
  // New props for preview functionality
  showPreview?: boolean
  previewCharLimit?: number
  previewClassName?: string
}

/**
 * Utility function to split content into preview and full content
 * Following the react-collapsed pattern
 */
const splitContent = (children: ReactNode): [ReactNode, ReactNode] => {
  if (Array.isArray(children)) {
    // For arrays: first child is preview, rest is full content
    if (children.length > 1) {
      return [children[0], children.slice(1)]
    } else {
      return [children[0], children]
    }
  }

  if (isValidElement(children) && children.type === React.Fragment) {
    // For React fragments: first child is preview, rest is full content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fragmentChildren = (children.props as any).children
    if (Array.isArray(fragmentChildren) && fragmentChildren.length > 1) {
      return [fragmentChildren[0], fragmentChildren.slice(1)]
    } else {
      return [fragmentChildren, fragmentChildren]
    }
  }

  // Single element: use as both preview and full content
  return [children, children]
}

/**
 * Expandable content section with optional preview functionality
 * This component MUST be used inside the Expandable component.
 */
export const ExpandableContent: FC<Props> = ({
  children,
  className,
  contentClassName,
  showPreview = false,
  previewCharLimit = 200,
  previewClassName,
}) => {
  const { isExpanded } = useExpandableContext()

  if (!showPreview) {
    // Normal expandable behavior - no preview
    return (
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          // Large max height (2000px) ensures most content fits; safe to increase if needed
          isExpanded ? 'max-h-[2000px] opacity-100 my-2' : 'max-h-0 opacity-0',
          contentClassName,
        )}
      >
        <div className={className}>{children}</div>
      </div>
    )
  }

  const isStringContent = typeof children === 'string'

  if (isStringContent) {
    // For strings: CSS-only approach - full content in DOM, CSS truncates
    const estimatedLines = Math.ceil(previewCharLimit / 50) // ~50 chars per line
    const maxHeightCollapsed = estimatedLines * 1.5 // Convert to em units

    return (
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden my-2',
          contentClassName,
          previewClassName,
        )}
        style={{
          maxHeight: isExpanded ? 'none' : `${maxHeightCollapsed}em`,
        }}
      >
        <Paragraph
          variant="body"
          className={cn('text-base whitespace-pre-line break-words', !isExpanded && 'line-clamp-3')}
          html
          // eslint-disable-next-line react/no-children-prop
          children={children}
        />
      </div>
    )
  }

  // For ReactNode: separate preview and full content
  const [previewContent, remainingContent] = splitContent(children)

  return (
    <>
      {/* Preview - always visible */}
      <div className={cn('my-2', previewClassName)}>{previewContent}</div>

      {/* Full content - with collapse animation */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[500px] opacity-100 my-2' : 'max-h-0 opacity-0',
          contentClassName,
        )}
      >
        <div className={className}>{remainingContent}</div>
      </div>
    </>
  )
}
