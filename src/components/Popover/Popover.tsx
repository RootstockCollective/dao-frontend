'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface Props {
  children: ReactNode
  content: ReactNode
  trigger?: 'click' | 'hover'
}

export const Popover = ({ children, content, trigger = 'click' }: Props) => {
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
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeft}
      className="w-fit h-fit relative flex justify-center"
    >
      <div onClick={() => setShow(!show)}>{children}</div>
      <div hidden={!show} className="min-w-fit w-96 h-fit absolute top-full left-full z-50 transition-all">
        <div className="rounded bg-zinc-900 p-3 shadow-[10px_30px_150px_rgba(46,38,92,0.25)] mb-[10px]">
          {content}
        </div>
      </div>
    </div>
  )
}
