import { FC } from 'react'
import { BodyVariants, EmphaseVariants, TagVariants } from './types'
import { Typography, TypographyProps } from './Typography'

type SpanVariant = BodyVariants | TagVariants | EmphaseVariants

interface Props extends Omit<TypographyProps<'span'>, 'as'> {
  variant?: SpanVariant
}

/**
 * Span Component
 *
 * Renders a <span> element with consistent styling.
 * Supports the following variants:
 * - body-l: font-size: 18px; font-family: font-rootstock-sans
 * - body: font-size: 16px; font-family: font-rootstock-sans
 * - body-s: font-size: 14px; font-family: font-rootstock-sans
 * - body-xs: font-size: 12px; font-family: font-rootstock-sans
 * - tag: font-size: 16px; font-family: font-rootstock-sans
 * - tag-s: font-size: 14px; font-family: font-rootstock-sans
 * - tag-m: font-size: 14px; font-family: font-rootstock-sans
 * - e1: font-size: 60px; font-family: font-kk-topo
 * - e2: font-size: 44px; font-family: font-kk-topo
 * - e2m: font-size: 40px; font-family: font-kk-topo
 * - e3: font-size: 16px; font-family: font-kk-topo
 */
export const Span: FC<Props> = ({ variant = 'body', children, ...rest }) => (
  <Typography as="span" variant={variant} {...rest}>
    {children}
  </Typography>
)
