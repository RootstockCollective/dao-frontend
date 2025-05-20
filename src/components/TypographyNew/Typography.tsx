import { cn } from '@/lib/utils'
import { CSSProperties, FC, ReactNode } from 'react'
import sanitizeHtml from 'sanitize-html'
import { BodyVariants, EmphaseVariants, HeaderVariants, TagVariants, TypographyElement } from './types'

type TypographyVariant = EmphaseVariants | HeaderVariants | BodyVariants | TagVariants

interface Props {
  children: ReactNode
  as?: TypographyElement
  variant?: TypographyVariant
  className?: string
  html?: boolean
  caps?: boolean
  'data-testid'?: string
  onClick?: () => void
}

export type TypographyProps = Props & CSSProperties

const variantClasses: Record<TypographyVariant, string> = {
  e1: 'font-kk-topo font-normal text-[3.75rem] leading-[106%] tracking-normal uppercase',
  e2: 'font-kk-topo font-normal text-[2.75rem] leading-[108%] tracking-normal uppercase',
  e2m: 'font-kk-topo font-normal text-[2.5rem] leading-[110%] tracking-normal uppercase',
  e3: 'font-kk-topo font-normal text-base leading-[125%] tracking-[0.02em] uppercase',
  h1: 'font-kk-topo font-normal text-2xl leading-[125%] tracking-normal',
  h1m: 'font-kk-topo font-normal text-[1.75rem] leading-[128%] tracking-normal',
  h2: 'font-kk-topo font-normal text-xl leading-[125%] tracking-[0.02em]',
  h3: 'font-kk-topo font-normal text-lg leading-[130%] tracking-[0.02em]',
  h4: 'font-rootstock-sans font-medium text-base leading-[150%] tracking-[0.08em]',
  h5: 'font-rootstock-sans font-medium text-xs leading-[150%] tracking-[0.05em]',
  bl: 'font-rootstock-sans font-normal text-[1.125rem] leading-[133%] tracking-normal',
  'bl-bold': 'font-rootstock-sans font-bold text-[1.125rem] leading-[133%] tracking-normal',
  b: 'font-rootstock-sans font-normal text-base leading-[150%] tracking-normal',
  'b-bold': 'font-rootstock-sans font-bold text-base leading-[150%] tracking-normal',
  bs: 'font-rootstock-sans font-normal text-sm leading-[145%] tracking-normal',
  'bs-bold': 'font-rootstock-sans font-bold text-sm leading-[145%] tracking-normal',
  bxs: 'font-rootstock-sans font-normal text-xs leading-[150%] tracking-normal',
  'bxs-bold': 'font-rootstock-sans font-bold text-xs leading-[150%] tracking-normal',
  t: 'font-rootstock-sans font-medium text-base leading-[150%] tracking-normal',
  ts: 'font-rootstock-sans font-medium text-sm leading-[145%] tracking-normal',
  tm: 'font-rootstock-sans font-medium text-sm leading-[145%] tracking-[0.08em] uppercase',
}

export const Typography: FC<TypographyProps> = ({
  children,
  as: Component = 'span',
  variant = 'b',
  className,
  html = false,
  caps = false,
  'data-testid': dataTestId,
  onClick,
  ...styles
}) => {
  const cleanHtml =
    html && typeof children === 'string'
      ? sanitizeHtml(children, {
          allowedAttributes: {
            a: ['href', 'target', 'rel', 'style'],
          },
        })
      : undefined

  return (
    <Component
      className={cn(className, variantClasses[variant], caps && 'uppercase')}
      style={{ ...styles }}
      onClick={onClick}
      dangerouslySetInnerHTML={cleanHtml ? { __html: cleanHtml } : undefined}
      data-testid={dataTestId}
    >
      {!cleanHtml && children}
    </Component>
  )
}
