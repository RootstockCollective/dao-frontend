'use client'
import { cn } from '@/lib/utils'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface Props {
  children: ReactNode
  content: ReactNode
  trigger?: 'click' | 'hover'
  background?: 'dark' | 'light'
  position?: 'top' | 'bottom' | 'right' | 'left'
  size?: 'small' | 'medium'
  hasCaret?: boolean
}

export const Popover = ({
  children,
  content,
  trigger = 'click',
  background = 'dark',
  position = 'bottom',
  size = 'medium',
  hasCaret = false,
}: Props) => {
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

  return (
    <div ref={wrapperRef} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeft} className="relative">
      <div onClick={() => setShow(!show)}>{children}</div>
      <div
        hidden={!show}
        className={cn(
          'absolute z-50 transition-all',
          position === 'top' && 'bottom-full',
          position === 'bottom' && 'top-full',
          position === 'right' && 'left-full bottom-full',
          position === 'left' && 'right-full bottom-full',
          size === 'small' && 'w-36',
          size === 'medium' && 'w-96',
        )}
        style={{ top: position === 'bottom' && hasCaret ? '15px' : '' }}
      >
        <div
          className={cn(
            'rounded bg-zinc-900 p-2 shadow-[10px_30px_150px_rgba(46,38,92,0.25)] mb-[10px] min-w-min',
            background === 'light' && 'bg-white',
          )}
        >
          {content}
          {hasCaret && <PopoverCaret position={position} />}
        </div>
      </div>
    </div>
  )
}

const PopoverCaret = ({ position }: { position: 'top' | 'bottom' | 'right' | 'left' }) => (
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
