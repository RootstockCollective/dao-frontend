import { FC } from 'react'
import { BodyVariants, EmphaseVariants, TagVariants } from './types'
import { BaseTypography, BaseTypographyProps } from './Typography'

type SpanVariant = BodyVariants | TagVariants | EmphaseVariants

interface Props extends Omit<BaseTypographyProps<'span'>, 'as'> {
  variant?: SpanVariant
}

/**
 * Span Component
 *
 * Renders a <span> element with consistent styling.
 *
 * @example
 * ```tsx
 * <Span variant="body-s" className="text-[#DEFF1A]">Proposal name</Span>
 * <Span variant="tag" bold>Status</Span>
 * ```
 *
 * Supports the following variants:
 *
 * **Body Variants:**
 * - body-l: font-size: 18px; font-family: font-rootstock-sans - **Figma: Body/BL Regular**
 * - body (default): font-size: 16px; font-family: font-rootstock-sans - **Figma: Body/B Regular**
 * - body-s: font-size: 14px; font-family: font-rootstock-sans - **Figma: Body/BS Regular**
 * - body-xs: font-size: 12px; font-family: font-rootstock-sans - **Figma: Body/BXS Regular**
 *
 * **Tag Variants:**
 * - tag: font-size: 16px; font-family: font-rootstock-sans - **Figma: Tags/T Regular**
 * - tag-s: font-size: 14px; font-family: font-rootstock-sans - **Figma: Tags/TS**
 *
 * **Emphasis Variants:**
 * - e1: font-size: 60px; font-family: font-kk-topo - **Figma: Emphase/E1**
 * - e2: font-size: 44px; font-family: font-kk-topo - **Figma: Emphase/E2**
 * - e3: font-size: 16px; font-family: font-kk-topo - **Figma: Emphase/E3**
 *
 * All variants support the `bold`, `caps`, and `html` props.
 */
export const Span: FC<Props> = ({ variant = 'body', children, ...rest }) => (
  <BaseTypography as="span" variant={variant} {...rest}>
    {children}
  </BaseTypography>
)
