import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { StylableComponentProps } from '../../app/builders/components/commonProps'

export type H1Pros = StylableComponentProps<HTMLHeadingElement> & PropsWithChildren

export const H1: FC<H1Pros> = ({ children, className }) => (
  <h1
    className={`${cn('grow text-left font-kk-topo uppercase text-v3-text-100 font-normal text-[2rem] leading-10 not-italic', className)}`}
  >
    {children}
  </h1>
)
