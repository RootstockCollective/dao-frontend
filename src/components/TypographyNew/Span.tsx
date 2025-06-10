import { FC } from 'react'
import { BodyVariants, TagVariants } from './types'
import { Typography, TypographyProps } from './Typography'

type SpanVariant = BodyVariants | TagVariants

interface Props extends Omit<TypographyProps<'span'>, 'as'> {
  variant?: SpanVariant
}

export const Span: FC<Props> = ({ variant = 'body', children, ...rest }) => (
  <Typography as="span" variant={variant} {...rest}>
    {children}
  </Typography>
)
