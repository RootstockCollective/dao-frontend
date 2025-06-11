import React, { useState } from 'react'
import { DropdownTrigger } from './DropdownTrigger'

export default {
  title: 'DropdownV3/DropdownTrigger',
  component: DropdownTrigger,
}

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="p-4 bg-v3-bg-primary">
      <DropdownTrigger aria-expanded={isOpen} aria-haspopup={true} onClick={() => setIsOpen(!isOpen)} />
    </div>
  )
}

export const CustomClassName = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="p-4 bg-v3-bg-primary">
      <DropdownTrigger
        className="hover:bg-v3-bg-accent-1 rounded-full p-2 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup={true}
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  )
}

export const Open = () => {
  return (
    <div className="p-4 bg-v3-bg-primary">
      <DropdownTrigger aria-expanded={true} aria-haspopup={true} />
    </div>
  )
}

export const Closed = () => {
  return (
    <div className="p-4 bg-v3-bg-primary">
      <DropdownTrigger aria-expanded={false} aria-haspopup={true} />
    </div>
  )
}
