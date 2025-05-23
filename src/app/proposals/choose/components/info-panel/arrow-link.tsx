import { AnchorHTMLAttributes } from 'react'
import ArrowIcon from './icons/arrow-icon'
import { cn } from '@/lib/utils'

/**
 * Link with a trailing orange arrow
 */
export function ArrowLink({ children, className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cn(
        'mt-2 w-fit block leading-none hover:underline decoration-primary text-primary',
        className,
      )}
    >
      {children}
      &nbsp;
      <ArrowIcon />
    </a>
  )
}
