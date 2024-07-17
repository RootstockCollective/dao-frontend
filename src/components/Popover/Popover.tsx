'use client'
import { cn } from '@/lib/utils'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface Props {
  children: ReactNode
  content: ReactNode
  trigger?: 'click' | 'hover'
  background?: 'dark' | 'light'
  position?: 'top' | 'bottom'
  size?: 'small' | 'medium'
}

export const Popover = ({
  children,
  content,
  trigger = 'click',
  background = 'dark',
  position = 'bottom',
  size = 'medium',
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
          'min-w-fit h-fit absolute z-50 transition-all',
          position === 'top' && 'bottom-full',
          position === 'bottom' && 'top-full',
          size === 'small' && 'w-48',
          size === 'medium' && 'w-96',
        )}
      >
        <div
          className={cn(
            'rounded bg-zinc-900 p-3 shadow-[10px_30px_150px_rgba(46,38,92,0.25)] mb-[10px]',
            background === 'light' && 'bg-white shadow-[10px_30px_150px_rgba(46,38,92,0.25)',
          )}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
