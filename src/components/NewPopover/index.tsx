import * as Popover from '@radix-ui/react-popover'
import React, { CSSProperties, ReactElement, ReactNode, RefObject, useEffect, useRef } from 'react'

interface NewPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor?: ReactElement
  anchorRef?: RefObject<HTMLElement | null>
  children?: ReactNode
  content?: ReactNode
  className?: string
  contentClassName?: string
  style?: CSSProperties
  contentStyle?: CSSProperties
  sideOffset?: number
  alignOffset?: number
}

export const NewPopover: React.FC<NewPopoverProps> = ({
  open,
  onOpenChange,
  anchor = <span />,
  anchorRef,
  children,
  content,
  className = '',
  contentClassName = '',
  style = {},
  contentStyle = {},
  sideOffset = -8,
  alignOffset = -24,
}) => {
  // If anchorRef is provided, create a hidden span and move it to the anchorRef's position
  const hiddenAnchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (anchorRef?.current && hiddenAnchorRef.current) {
      const anchorNode = anchorRef.current
      const hiddenNode = hiddenAnchorRef.current
      // Position the hidden span over the anchorNode
      const rect = anchorNode.getBoundingClientRect()
      hiddenNode.style.position = 'absolute'
      hiddenNode.style.top = `${rect.top + window.scrollY}px`
      hiddenNode.style.left = `${rect.left + window.scrollX}px`
      hiddenNode.style.width = `${rect.width}px`
      hiddenNode.style.height = `${rect.height}px`
      hiddenNode.style.pointerEvents = 'none'
      hiddenNode.style.opacity = '0'
      document.body.appendChild(hiddenNode)
      return () => {
        if (hiddenNode.parentNode) {
          hiddenNode.parentNode.removeChild(hiddenNode)
        }
      }
    }
  }, [anchorRef, open])

  const offsetWidth = anchorRef?.current?.offsetWidth

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      {anchorRef ? (
        <Popover.Anchor asChild>
          <span ref={hiddenAnchorRef} />
        </Popover.Anchor>
      ) : (
        <Popover.Anchor asChild>{anchor}</Popover.Anchor>
      )}
      <Popover.Portal>
        <Popover.Content
          forceMount
          side="top"
          align="end"
          sideOffset={sideOffset}
          alignOffset={offsetWidth ? offsetWidth + alignOffset : -alignOffset}
          className={`bg-white shadow-lg rounded-[4px] p-4 ${className}`}
          style={style}
        >
          <div className={contentClassName} style={contentStyle}>
            {content}
            {children}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
