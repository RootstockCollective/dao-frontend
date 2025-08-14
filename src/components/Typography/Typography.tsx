import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import sanitizeHtml from 'sanitize-html'
import type { BodyVariants, EmphaseVariants, HeaderVariants, TagVariants } from './types'

/**
 * Type definition for all available typography variants.
 * Includes emphasis (e1-e3), headers (h1-h5), body text (body, body-l, body-s, body-xs),
 * and tag variants (tag, tag-s).
 */
type TypographyVariant = EmphaseVariants | HeaderVariants | BodyVariants | TagVariants

/**
 * Props for the BaseTypography component.
 * @template T - The HTML element type to render (defaults to 'span')
 * @property {T} [as] - The HTML element to render (e.g., 'div', 'p', 'span')
 * @property {TypographyVariant} [variant='body'] - The typography style variant to apply
 * @property {boolean} [html=false] - Whether to render children as HTML (sanitized)
 * @property {boolean} [caps=false] - Whether to apply uppercase text transform
 * @property {boolean} [bold=false] - Whether to apply bold font weight
 * @property {string} [data-testid] - Test ID for testing purposes
 * @extends {ComponentPropsWithoutRef<T>} - Inherits all props from the underlying HTML element
 */
export type BaseTypographyProps<T extends ElementType> = {
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
  e1: 'font-kk-topo font-normal text-[3.25rem] md:text-6xl leading-[108%] md:leading-[106%] uppercase',
  e2: 'font-kk-topo font-normal text-[2.5rem] md:text-[2.75rem] leading-[110%] md:leading-[108%] uppercase',
  e3: 'font-kk-topo font-normal text-[2rem] md:text-base leading-[110%] md:leading-[125%] md:tracking-[0.02em] uppercase',
  h1: 'font-kk-topo font-normal text-[1.75rem] md:text-[2rem] leading-[128%] md:leading-[125%]',
  h2: 'font-kk-topo font-normal text-2xl leading-[128%] md:leading-[125%] md:tracking-[0.02em]',
  h3: 'font-kk-topo font-normal text-xl leading-[128%] md:leading-[130%] md:tracking-[0.02em]',
  h4: 'font-rootstock-sans font-medium text-base leading-[150%] tracking-[0.08em]',
  h5: 'font-rootstock-sans font-medium text-xs leading-[150%] tracking-[0.05em]',
  'body-l': 'font-rootstock-sans font-normal text-lg leading-[118%] md:leading-[133%]',
  body: 'font-rootstock-sans font-normal text-base leading-[150%]',
  'body-s': 'font-rootstock-sans font-normal text-sm leading-[145%]',
  'body-xs': 'font-rootstock-sans font-normal text-xs leading-[150%]',
  tag: 'font-rootstock-sans font-medium text-base leading-[150%]',
  'tag-s': 'font-rootstock-sans font-medium text-sm leading-[145%]',
}

/**
 * BaseTypography Component
 *
 * A flexible typography component that provides consistent text styling across the application.
 * This is an abstract base component that should not be used directly. Instead, use one of the following
 * specific components based on your needs:
 *
 * 1. For headings (h1-h5): Use the <Header> component
 *    - Supports variants: h1, h2, h3, h4, h5, e1, e2, e3
 *    - Example: <Header variant="h1">Main Title</Header>
 *
 * 2. For paragraphs: Use the <Paragraph> component
 *    - Supports variants: body-l, body, body-s, body-xs
 *    - Example: <Paragraph variant="body">Regular paragraph text</Paragraph>
 *
 * 3. For inline text: Use the <Span> component
 *    - Supports variants: body-l, body, body-s, body-xs, tag, tag-s
 *    - Example: <Span variant="body-s">Small inline text</Span>
 *
 * 4. For labels: Use the <Label> component
 *    - Supports variants: tag, tag-s
 *    - Example: <Label variant="tag">Form Label</Label>
 *
 * Each component supports additional modifiers:
 * - bold: Makes text bold (uses font-medium for body-s/body-xs, font-bold for others)
 * - caps: Transforms text to uppercase
 * - html: Allows rendering sanitized HTML content
 *
 * @template T - The HTML element type to render
 * @param {BaseTypographyProps<T>} props - Component props
 * @returns {JSX.Element} Rendered typography component
 *
 * @internal
 * This component is meant to be used as a base for more specific typography components.
 * Direct usage is discouraged in favor of the specific variant components.
 * Please DO NOT use this component directly, use the specific variant components instead.
 */
export function BaseTypography<T extends ElementType>({
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
}: BaseTypographyProps<T>) {
  const Component: ElementType = as
  const isHtml = html && typeof children === 'string'
  const cleanHtml = isHtml
    ? sanitizeHtml(children as string, {
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
    'tracking-[0.07em] md:tracking-[0.08em] leading-[145%] md:leading-[150%]': variant === 'tag' && caps,
  }

  /**
   * React best practice: never set both children and dangerouslySetInnerHTML on the same element.
   * See: https://react.dev/reference/react-dom/components/common#dangerouslysetinnerhtml
   * This ensures no runtime error and allows both plain text/JSX and HTML content.
   */
  if (isHtml) {
    return (
      <Component
        className={cn(variantClasses[variant], modifierClasses, className)}
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: cleanHtml! }}
        data-testid={dataTestId}
        {...props}
      />
    )
  }

  return (
    <Component
      className={cn(variantClasses[variant], modifierClasses, className)}
      onClick={onClick}
      data-testid={dataTestId}
      {...props}
    >
      {children}
    </Component>
  )
}
