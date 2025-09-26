'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode, useState } from 'react'
import { ExpandableContext } from './ExpandableContext'
import { Paragraph } from '../Typography'

// Main container component
interface Props {
  children: ReactNode
  className?: string
  dataTestId?: string
  // Initial expanded state (defaults to false)
  expanded?: boolean
  // Callback function called when the expanded state changes
  onToggleExpanded?: (isExpanded: boolean) => void
  // Optional preview text to show when collapsed
  previewText?: string
  // Optional preview text styling
  previewClassName?: string
  // Character limit for preview text truncation (defaults to 200)
  previewCharLimit?: number
}

/**
 * Expandable component that provides collapsible content functionality.
 *
 * This component creates an expandable container that can show/hide content
 * with smooth animations. It uses React context to manage the expanded state
 * and provides a toggle mechanism for child components.
 *
 * @example
 * ```tsx
 * <Expandable
 *   className="border rounded-lg p-4"
 *   onToggleExpanded={(isExpanded) => console.log('Expanded:', isExpanded)}
 * >
 *   <ExpandableHeader>
 *     <h3>Click to expand</h3>
 *   </ExpandableHeader>
 *   <ExpandableContent>
 *     <p>This content is hidden by default and can be toggled.</p>
 *     <p>More content here...</p>
 *   </ExpandableContent>
 *   <ExpandableFooter>
 *     <p>Footer content here...</p>
 *   </ExpandableFooter>
 * </Expandable>
 * ```
 *
 * @example
 * ```tsx
 * <Expandable
 *   previewText="This is a preview of the content..."
 *   previewClassName="text-gray-600"
 * >
 *   <ExpandableHeader>
 *     <h3>Description</h3>
 *   </ExpandableHeader>
 *   <ExpandableContent>
 *     <p>Full content here...</p>
 *   </ExpandableContent>
 * </Expandable>
 * ```
 */
export const Expandable: FC<Props> = ({
  children,
  className,
  dataTestId,
  expanded = false,
  onToggleExpanded,
  previewText,
  previewClassName,
  previewCharLimit = 200,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    onToggleExpanded?.(!isExpanded)
  }

  // Handle preview text truncation internally
  const shouldTruncatePreview = previewText && previewText.length > previewCharLimit
  const displayPreviewText = shouldTruncatePreview
    ? previewText.substring(0, previewCharLimit) + '...'
    : previewText

  return (
    <ExpandableContext.Provider value={{ isExpanded, toggleExpanded }}>
      <div className={cn('flex flex-col gap-2', className)} data-testid={dataTestId}>
        {children}
        {previewText && !isExpanded && (
          <Paragraph
            variant="body"
            className={cn('text-base whitespace-pre-line break-words', previewClassName)}
            html
            // eslint-disable-next-line react/no-children-prop
            children={displayPreviewText}
          />
        )}
      </div>
    </ExpandableContext.Provider>
  )
}
