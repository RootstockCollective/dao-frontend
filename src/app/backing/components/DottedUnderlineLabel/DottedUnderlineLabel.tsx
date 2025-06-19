import { CommonComponentProps } from '@/components/commonProps'
import { FC } from 'react'

export const DottedUnderlineLabel: FC<CommonComponentProps> = ({ className = '', children }) => {
  return (
    <span
      className={`underline decoration-dotted decoration-[0.2rem] underline-offset-4 cursor-pointer ${className}`}
    >
      {children}
    </span>
  )
}
