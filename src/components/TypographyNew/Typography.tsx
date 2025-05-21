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
  bold?: boolean
  'data-testid'?: string
  onClick?: () => void
}

export type TypographyProps = Props & CSSProperties

const variantClasses: Record<TypographyVariant, string> = {
  e1: 'font-kk-topo font-normal text-[60px] leading-[63.6px] tracking-normal uppercase',
  e2: 'font-kk-topo font-normal text-[44px] leading-[47.52px] tracking-normal uppercase',
  e2m: 'font-kk-topo font-normal text-[40px] leading-[44px] tracking-normal uppercase',
  e3: 'font-kk-topo font-normal text-[16px] leading-[20px] tracking-[0.02em] uppercase',
  h1: 'font-kk-topo font-normal text-[24px] leading-[30px] tracking-normal',
  h1m: 'font-kk-topo font-normal text-[28px] leading-[35.84px] tracking-normal',
  h2: 'font-kk-topo font-normal text-[20px] leading-[25px] tracking-[0.02em]',
  h3: 'font-kk-topo font-normal text-[18px] leading-[23.4px] tracking-[0.02em]',
  h4: 'font-rootstock-sans font-medium text-[16px] leading-[24px] tracking-[0.08em]',
  h5: 'font-rootstock-sans font-medium text-[12px] leading-[18px] tracking-[0.05em]',
  'body-l': 'font-rootstock-sans font-normal text-[18px] leading-[23.94px] tracking-normal',
  body: 'font-rootstock-sans font-normal text-[16px] leading-[24px] tracking-normal',
  'body-s': 'font-rootstock-sans font-normal text-[14px] leading-[20.3px] tracking-normal',
  'body-xs': 'font-rootstock-sans font-normal text-[12px] leading-[18px] tracking-normal',
  tag: 'font-rootstock-sans font-medium text-[16px] leading-[24px] tracking-normal',
  'tag-s': 'font-rootstock-sans font-medium text-[14px] leading-[20.3px] tracking-normal',
  'tag-m': 'font-rootstock-sans font-medium text-[14px] leading-[20.3px] tracking-[0.08em]',
}

export const Typography: FC<TypographyProps> = ({
  children,
  as: Component = 'span',
  variant = 'body',
  className = '',
  html = false,
  caps = false,
  bold = false,
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

  const modifierClasses = {
    'font-bold': bold,
    uppercase: caps,
  }

  return (
    <Component
      className={cn(variantClasses[variant], className, modifierClasses)}
      style={{ ...styles }}
      onClick={onClick}
      dangerouslySetInnerHTML={cleanHtml ? { __html: cleanHtml } : undefined}
      data-testid={dataTestId}
    >
      {!cleanHtml && children}
    </Component>
  )
}
