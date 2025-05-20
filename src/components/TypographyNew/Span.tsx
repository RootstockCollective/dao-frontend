import { FC } from 'react'
import { BodyVariants, TagVariants } from './types'
import { Typography, TypographyProps } from './Typography'

type SpanVariant = BodyVariants | TagVariants

interface Props extends Omit<TypographyProps, 'as'> {
  variant?: SpanVariant
}

export const Span: FC<Props> = ({ variant = 'b', children, 'data-testid': dataTestId = '', ...rest }) => (
  <Typography as="span" variant={variant} data-testid={`Span${dataTestId}`} {...rest}>
    {children}
  </Typography>
)
