import { LabelVariants, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'

interface Props {
  variant?: LabelVariants
  children: ReactNode
}

const classesByVariant: Record<LabelVariants, string> = {
  normal: '',
  light: 'light',
  strong: 'strong',
}

export const Label: FC<Props> = ({ variant = 'normal', children }) => (
  <Typography tagVariant='label' className={classesByVariant[variant]}>{children}</Typography>
)
