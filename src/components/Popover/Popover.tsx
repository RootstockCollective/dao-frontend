'use client'
import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'

type Position = 'top' | 'bottom' | 'right' | 'left' | 'left-bottom' | 'left-top'

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'content'> {
  children: ReactNode
  content: ReactNode
  disabled?: boolean
  trigger?: 'click' | 'hover'
  background?: 'dark' | 'light'
  position?: Position
  size?: 'small' | 'medium'
  hasCaret?: boolean
  contentContainerClassName?: HTMLAttributes<HTMLDivElement>['className']
  contentSubContainerClassName?: HTMLAttributes<HTMLDivElement>['className']
  contentSubcontainerProps?: HTMLAttributes<HTMLDivElement>
}
// We might have to refactor this to de-couple it a bit
export const Popover = ({
  children,
  content,
  disabled = false,
  trigger = 'click',
  background = 'dark',
  position = 'bottom',
  size = 'medium',
  hasCaret = false,
  className,
  contentContainerClassName,
  contentSubContainerClassName,
  contentSubcontainerProps = {},
}: PopoverProps) => {
  const [show, setShow] = useState(false)
  const wrapperRef = useRef<any>(null)

  const handleMouseOver = () => {
    if (trigger === 'hover') {
      setShow(true)
    }
  }

  const handleMouseLeft = () => {
    if (trigger === 'hover') {
      setShow(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShow(false)
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [show, wrapperRef])

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeft}
      className={cn('relative', className)}
    >
      <div onClick={() => setShow(!show)}>{children}</div>
      <div
        hidden={!show}
        className={cn(
          'absolute z-50 transition-all',
          position === 'top' && 'bottom-full',
          position === 'bottom' && 'top-full',
          position === 'right' && 'left-full bottom-full',
          position === 'left' && 'right-full',
          position === 'left-bottom' && 'right-0 top-full',
          position === 'left-top' && 'right-full bottom-full',
          size === 'small' && 'w-36',
          size === 'medium' && 'w-96',
          contentContainerClassName,
        )}
        style={{ top: position === 'bottom' && hasCaret ? '15px' : '' }}
      >
        <div
          className={cn(
            'rounded-lg bg-[#1A1A1A] border border-white border-opacity-20 p-2 shadow-[10px_30px_150px_rgba(46,38,92,0.25)] mb-[10px] min-w-min',
            background === 'light' && 'bg-white',
            contentSubContainerClassName,
          )}
          {...contentSubcontainerProps}
        >
          {content}
          {hasCaret && <PopoverCaret position={position} />}
        </div>
      </div>
    </div>
  )
}

const PopoverCaret = ({ position }: { position: Position }) => (
  <>
    {position === 'top' && (
      <div className="absolute inset-x-0 flex justify-center" style={{ bottom: '2px' }}>
        <div className="w-0 h-0 border-t-8 border-t-white border-x-8 border-x-transparent"></div>
      </div>
    )}
    {position === 'bottom' && (
      <div className="absolute inset-x-0 flex justify-center" style={{ top: '-8px' }}>
        <div className="w-0 h-0 border-b-8 border-b-white border-x-8 border-x-transparent"></div>
      </div>
    )}
    {position === 'right' && (
      <div className="absolute top-1/2 bottom-1/2 flex justify-center" style={{ left: '-8px' }}>
        <div className="w-0 h-0 border-r-8 border-r-white border-y-8 border-y-transparent"></div>
      </div>
    )}
    {position === 'left' && (
      <div className="absolute top-1/2 bottom-1/2 flex justify-center" style={{ right: '-8px' }}>
        <div className="w-0 h-0 border-l-8 border-l-white border-y-8 border-y-transparent"></div>
      </div>
    )}
  </>
)
