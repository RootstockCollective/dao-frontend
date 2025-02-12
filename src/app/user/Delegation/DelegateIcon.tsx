import Image from 'next/image'
import { HTMLAttributes } from 'react'
import iconImage from './images/delegate-icon.png'

const colors = ['#4C43F1', '#02B70B', '#F15D43', '#F1E043', '#F143E6']

interface DelegateIconProps extends HTMLAttributes<HTMLElement> {
  colorIndex: number
}

export default function DelegateIcon({ colorIndex, className, ...props }: DelegateIconProps) {
  return (
    <div className={`relative w-10 h-10 ${className}`} {...props}>
      {/* Icon */}
      <Image src={iconImage} alt="Delegate icon" className="w-full h-full filter grayscale" />

      {/* Color mask */}
      <div
        className="absolute inset-0 mix-blend-multiply opacity-75"
        style={{ backgroundColor: colors[colorIndex % colors.length] }}
      />
    </div>
  )
}
