import { cn } from '@/lib/utils'

import { CommonComponentProps } from '../commonProps'

type InfoContainer = CommonComponentProps & {
  title?: string
}

export const InfoContainer = ({ children, className = '', title }: InfoContainer) => {
  return (
    <div
      className={cn('flex flex-col items-start gap-2 self-stretch p-6 pt-10 rounded-sm', className)}
      data-testid={'InfoContainer'}
    >
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  )
}
