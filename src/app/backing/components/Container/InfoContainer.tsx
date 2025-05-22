import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

type InfoContainer = CommonComponentProps & PropsWithChildren

export const InfoContainer: FC<InfoContainer> = ({ children, dataTestid, className = '' }) => {
  return (
    <div
      className={cn('flex flex-col items-start gap-2 grow p-6 pt-10', className)}
      data-testid={`${dataTestid}_InfoContainer`}
    >
      {children}
    </div>
  )
}
