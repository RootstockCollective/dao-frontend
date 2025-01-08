import { TypographyTagVariants } from '@/components/Typography/types'
import { cn } from '@/lib/utils'
import { CSSProperties, FC, ReactNode } from 'react'
import sanitizeHtml from 'sanitize-html'

const classesByTag: Record<TypographyTagVariants, string> = {
  h1: 'font-bold text-[1.7rem]',
  h2: '',
  p: '',
  label: '',
  span: '',
}

interface Props {
  tagVariant: TypographyTagVariants
  children: ReactNode
  className?: string
  fontFamily?: 'sora' | 'kk-topo' | 'rootstock-sans'
  onClick?: () => void
  html?: string
  'data-testid'?: string
}

export type TypographyProps = Props & CSSProperties

export const Typography: FC<TypographyProps> = ({
  tagVariant = 'p',
  children,
  className,
  fontFamily = 'rootstock-sans',
  onClick,
  html,
  'data-testid': dataTestId,
  ...styles
}) => {
  const Component = tagVariant
  const classes = classesByTag[tagVariant]
  const fontFamilyClass = fontFamily ? `font-${fontFamily}` : ''
  const cleanHtml =
    html &&
    sanitizeHtml(html, {
      allowedAttributes: {
        a: ['href', 'target', 'rel', 'style'],
      },
    })

  return (
    <Component
      className={cn([fontFamilyClass, classes, className])}
      style={{ ...styles }}
      onClick={onClick}
      dangerouslySetInnerHTML={cleanHtml ? { __html: cleanHtml } : undefined}
      data-testid={`Typography${dataTestId || ''}`}
    >
      {children}
    </Component>
  )
}
