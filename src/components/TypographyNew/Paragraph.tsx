import { FC } from 'react'
import { BodyVariants } from './types'
import { Typography, TypographyProps } from './Typography'

type ParagraphVariant = BodyVariants

interface Props extends Omit<TypographyProps, 'as'> {
  variant?: ParagraphVariant
}

export const Paragraph: FC<Props> = ({
  variant = 'body',
  children,
  'data-testid': dataTestId = '',
  ...rest
}) => (
  <Typography as="p" variant={variant} data-testid={`Paragraph${dataTestId}`} {...rest}>
    {children}
  </Typography>
)
