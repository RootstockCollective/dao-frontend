import React from 'react'

interface SeparatorBarProps {
  className?: string
}

const SeparatorBar: React.FC<SeparatorBarProps> = ({ className = '' }) => {
  return <span className={`w-[2px] h-[6px] rounded-[10px] bg-v3-text-40 ${className}`} />
}

export default SeparatorBar
