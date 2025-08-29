'use client'
import { FC, ReactNode } from 'react'
import { Expandable } from './Expandable'
import { ExpandableHeader } from './ExpandableHeader'
import { ExpandableContent } from './ExpandableContent'
import { ExpandableFooter } from './ExpandableFooter'

// Convenience component for the entire expandable structure
interface Props {
  alwaysVisible: ReactNode
  expandable: ReactNode
  className?: string
  contentClassName?: string
  footer?: ReactNode
}

export const ExpandableComponent: FC<Props> = ({
  alwaysVisible,
  expandable,
  className,
  contentClassName,
  footer,
}) => {
  return (
    <Expandable className={className}>
      <ExpandableHeader>{alwaysVisible}</ExpandableHeader>
      {expandable && <ExpandableContent contentClassName={contentClassName}>{expandable}</ExpandableContent>}
      {footer && <ExpandableFooter>{footer}</ExpandableFooter>}
    </Expandable>
  )
}
