'use client'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { Paragraph } from '../Typography'
import { useExpandableContext } from './ExpandableContext'

interface ExpandablePreviewProps {
  // Preview text to show when collapsed
  previewText: string
  // Optional preview text styling
  previewClassName?: string
  // Character limit for preview text truncation (defaults to 200)
  previewCharLimit?: number
}

/**
 * ExpandablePreview component that shows preview text when the expandable is collapsed.
 * This component MUST be used inside the Expandable component.
 *
 * @example
 * ```tsx
 * <Expandable>
 *   <ExpandableHeader>
 *     <h3>Description</h3>
 *   </ExpandableHeader>
 *   <ExpandablePreview
 *     previewText="This is a preview of the content..."
 *     previewClassName="text-gray-600"
 *     previewCharLimit={150}
 *   />
 *   <ExpandableContent>
 *     <p>Full content here...</p>
 *   </ExpandableContent>
 * </Expandable>
 * ```
 */
export const ExpandablePreview: FC<ExpandablePreviewProps> = ({
  previewText,
  previewClassName,
  previewCharLimit = 200,
}) => {
  const { isExpanded } = useExpandableContext()

  // Handle preview text truncation internally
  const shouldTruncatePreview = previewText && previewText.length > previewCharLimit
  const displayPreviewText = shouldTruncatePreview
    ? previewText.substring(0, previewCharLimit) + '...'
    : previewText

  if (!previewText || isExpanded) {
    return null
  }

  return (
    <Paragraph
      variant="body"
      className={cn('text-base whitespace-pre-line break-words', previewClassName)}
      html
      // eslint-disable-next-line react/no-children-prop
      children={displayPreviewText}
    />
  )
}
