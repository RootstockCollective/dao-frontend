import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import sanitizeHtml from 'sanitize-html'
import type { BodyVariants, EmphaseVariants, HeaderVariants, TagVariants } from './types'

/**
 * Type definition for all available typography variants.
 * Includes emphasis (e1-e3), headers (h1-h5), body text (body, body-l, body-s, body-xs),
 * and tag variants (tag, tag-s, tag-m).
 */
type TypographyVariant = EmphaseVariants | HeaderVariants | BodyVariants | TagVariants

/**
 * Props for the Typography component.
 * @template T - The HTML element type to render (defaults to 'span')
 * @property {T} [as] - The HTML element to render (e.g., 'div', 'p', 'span')
 * @property {TypographyVariant} [variant='body'] - The typography style variant to apply
 * @property {boolean} [html=false] - Whether to render children as HTML (sanitized)
 * @property {boolean} [caps=false] - Whether to apply uppercase text transform
 * @property {boolean} [bold=false] - Whether to apply bold font weight
 * @property {string} [data-testid] - Test ID for testing purposes
 * @property {React.ComponentPropsWithoutRef<T>} - All other props are forwarded to the underlying component
 */
export type TypographyProps<T extends ElementType> = {
  as?: T
  variant?: TypographyVariant
  html?: boolean
  caps?: boolean
  bold?: boolean
  'data-testid'?: string
} & ComponentPropsWithoutRef<T>

/**
 * Mapping of typography variants to their corresponding Tailwind CSS classes.
 * Each variant defines specific font family, size, line height, and tracking (letter spacing).
 */
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

/**
 * Typography Component
 *
 * A flexible typography component that provides consistent text styling across the application.
 * This is an abstract base component that should not be used directly. Instead, use one of the following
 * specific components based on your needs:
 *
 * 1. For headings (h1-h5): Use the <Header> component
 *    - Supports variants: h1, h1m, h2, h3, h4, h5, e1, e2, e2m, e3
 *    - Example: <Header variant="h1">Main Title</Header>
 *
 * 2. For paragraphs: Use the <Paragraph> component
 *    - Supports variants: body-l, body, body-s, body-xs
 *    - Example: <Paragraph variant="body">Regular paragraph text</Paragraph>
 *
 * 3. For inline text: Use the <Span> component
 *    - Supports variants: body-l, body, body-s, body-xs, tag, tag-s, tag-m
 *    - Example: <Span variant="body-s">Small inline text</Span>
 *
 * 4. For labels: Use the <Label> component
 *    - Supports variants: tag, tag-s, tag-m
 *    - Example: <Label variant="tag">Form Label</Label>
 *
 * Each component supports additional modifiers:
 * - bold: Makes text bold (uses font-medium for body-s/body-xs, font-bold for others)
 * - caps: Transforms text to uppercase
 * - html: Allows rendering sanitized HTML content
 *
 * @template T - The HTML element type to render
 * @param {TypographyProps<T>} props - Component props
 * @returns {JSX.Element} Rendered typography component
 *
 * @internal
 * This component is meant to be used as a base for more specific typography components.
 * Direct usage is discouraged in favor of the specific variant components.
 * Please DO NOT use this component directly, use the specific variant components instead.
 */
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
      // All props must be forwarded to the underlying component to ensure that
      // wrapping components (like Tooltip) function correctly.
      {...props}
    >
      {!cleanHtml && children}
    </Component>
  )
}
