'use client'
import { ReactNode } from 'react'

import { Expandable } from './Expandable'
import { ExpandableContent } from './ExpandableContent'
import { ExpandableFooter } from './ExpandableFooter'
import { ExpandableHeader } from './ExpandableHeader'

// Convenience component for the entire expandable structure
interface Props {
  alwaysVisible: ReactNode
  expandable: ReactNode
  className?: string
  contentClassName?: string
  footer?: ReactNode
}

export const ExpandableComponent = ({
  alwaysVisible,
  expandable,
  className,
  contentClassName,
  footer,
}: Props) => {
  return (
    <Expandable className={className}>
      <ExpandableHeader>{alwaysVisible}</ExpandableHeader>
      {expandable && <ExpandableContent contentClassName={contentClassName}>{expandable}</ExpandableContent>}
      {footer && <ExpandableFooter>{footer}</ExpandableFooter>}
    </Expandable>
  )
}
