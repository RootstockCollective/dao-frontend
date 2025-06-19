import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

type InfoContainer = CommonComponentProps & {
  title?: string
}

export const InfoContainer: FC<InfoContainer> = ({ children, className = '', title }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-2 self-stretch p-6 pt-10 rounded-sm bg-v3-bg-accent-80',
        className,
      )}
      data-testid={'InfoContainer'}
    >
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  )
}
