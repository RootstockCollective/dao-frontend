import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

type InfoContainer = CommonComponentProps & PropsWithChildren

export const InfoContainer: FC<InfoContainer> = ({ children, dataTestid, className = '' }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-start w-[53.5rem] gap-2 grow self-stretch p-6 pt-10 rounded-sm bg-v3-bg-accent-80',
        className,
      )}
      data-testid={`${dataTestid}_InfoContainer`}
    >
      {children}
    </div>
  )
}
