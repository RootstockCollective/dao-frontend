import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import sanitizeHtml from 'sanitize-html'
import type { BodyVariants, EmphaseVariants, HeaderVariants, TagVariants } from './types'

type TypographyVariant = EmphaseVariants | HeaderVariants | BodyVariants | TagVariants

export type TypographyProps<T extends ElementType> = {
  as?: T
  variant?: TypographyVariant
  html?: boolean
  caps?: boolean
  bold?: boolean
  'data-testid'?: string
} & ComponentPropsWithoutRef<T>

export const variantClasses: Record<TypographyVariant, string> = {
  e1: 'font-kk-topo font-normal text-6xl leading-[63.6px] tracking-normal uppercase',
  e2: 'font-kk-topo font-normal text-[2.75rem] leading-[47.52px] tracking-normal uppercase',
  e2m: 'font-kk-topo font-normal text-[2.5rem] leading-[44px] tracking-normal uppercase',
  e3: 'font-kk-topo font-normal text-base leading-[20px] tracking-[0.02em] uppercase',
  h1: 'font-kk-topo font-normal text-[2rem] leading-[30px] tracking-normal',
  h1m: 'font-kk-topo font-normal text-[28px] leading-[35.84px] tracking-normal',
  h2: 'font-kk-topo font-normal text-2xl leading-[25px] tracking-[0.02em]',
  h3: 'font-kk-topo font-normal text-xl leading-[23.4px] tracking-[0.02em]',
  h4: 'font-rootstock-sans font-medium text-base leading-[24px] tracking-[0.08em]',
  h5: 'font-rootstock-sans font-medium text-xs leading-[18px] tracking-[0.05em]',
  'body-l': 'font-rootstock-sans font-normal text-lg leading-[23.94px] tracking-normal',
  body: 'font-rootstock-sans font-normal text-base leading-[24px] tracking-normal',
  'body-s': 'font-rootstock-sans font-normal text-sm leading-[20.3px] tracking-normal',
  'body-xs': 'font-rootstock-sans font-normal text-xs leading-[18px] tracking-normal',
  tag: 'font-rootstock-sans font-medium text-base leading-[24px] tracking-normal',
  'tag-s': 'font-rootstock-sans font-medium text-sm leading-[20.3px] tracking-normal',
  'tag-m': 'font-rootstock-sans font-medium text-sm leading-[20.3px] tracking-[0.08em]',
}

export function Typography<T extends ElementType>({
  children,
  as = 'span' as T,
  variant = 'body',
  className = '',
  html = false,
  caps = false,
  bold = false,
  'data-testid': dataTestId,
  onClick,
  ...props
}: TypographyProps<T>) {
  const Component: ElementType = as
  const cleanHtml =
    html && typeof children === 'string'
      ? sanitizeHtml(children, {
          allowedAttributes: {
            a: ['href', 'target', 'rel', 'style'],
          },
        })
      : undefined

  // Use font-medium for bold in body-s and body-xs variants, font-bold for others
  const boldClass = /^body-(xs|s)$/.test(variant) ? 'font-medium' : 'font-bold'
  const modifierClasses = {
    [boldClass]: bold,
    uppercase: caps,
  }

  return (
    <Component
      className={cn(variantClasses[variant], className, modifierClasses)}
      onClick={onClick}
      dangerouslySetInnerHTML={cleanHtml ? { __html: cleanHtml } : undefined}
      data-testid={dataTestId}
      // All props must be forwarded to the underlying component to ensure that wrapping components (like Tooltip) function correctly.
      {...props}
    >
      {!cleanHtml && children}
    </Component>
  )
}
