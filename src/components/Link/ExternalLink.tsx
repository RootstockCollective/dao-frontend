import { cn } from '@/lib/utils'
import { FC } from 'react'
import { PiArrowUpRightLight } from 'react-icons/pi'
import { ExternalLinkProps } from './types'

/**
 * Styled anchor tag. The wrapped 'a' tag can be replaced by a custom
 * component by providing a `component` prop
 */
export const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  variant = 'default',
  component: Component = 'a',
  // can be customized by providing additional classnames
  className,
  ...props
}) => {
  return (
    <Component
      {...props}
      className={cn(
        'inline-flex items-center gap-1.5 font-sora underline underline-offset-2 underline-thick hover:cursor-pointer w-fit',
        { 'tracking-tight leading-tight text-base': variant === 'menu' },
        { 'leading-normal text-sm': variant === 'default' },
        { 'leading-nornal text-base text-primary': variant === 'section-header' },
        // combines hardcoded styles with classes coming from props
        className,
      )}
    >
      {children}
      {variant === 'menu' && <PiArrowUpRightLight />}
    </Component>
  )
}
