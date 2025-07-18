import { cn } from '@/lib/utils'
import { FC } from 'react'
import { ArrowRight, ArrowUpRightLightIcon } from '../Icons'
import { ExternalLinkProps } from './types'

/**
 * Styled anchor tag. The wrapped 'a' tag can be replaced by a custom
 * component by providing a `component` prop
 */
export const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  variant = 'default',
  component: Component = 'a',
  underline = true,
  // can be customized by providing additional classnames
  className,
  ...props
}) => {
  return (
    <Component
      {...props}
      className={cn(
        'inline-flex items-center gap-1.5 font-sora hover:cursor-pointer w-fit',
        { 'tracking-tight leading-tight text-base': variant === 'menu' },
        { 'leading-normal text-sm': variant === 'default' },
        { 'leading-nornal text-base text-primary': variant === 'section-header' },
        { 'underline underline-offset-2 underline-thick': underline },
        // combines hardcoded styles with classes coming from props
        className,
      )}
    >
      {children}
      {variant === 'menu' && <ArrowUpRightLightIcon />}
      {variant === 'hero' && <ArrowRight />}
    </Component>
  )
}
