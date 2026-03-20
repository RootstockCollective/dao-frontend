import React from 'react'

export interface SeparatorBarProps {
  className?: string
}

export function SeparatorBar({ className = '' }: SeparatorBarProps) {
  return <span className={`w-[2px] h-[6px] rounded-[10px] bg-v3-text-40 ${className}`} />
}
