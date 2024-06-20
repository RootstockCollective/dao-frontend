import { HeaderVariants, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'

const classesByVariant: Record<HeaderVariants, string> = {
  h1: 'text-[1.7rem] font-bold',
  h2: '',
}

interface Props {
  variant?: HeaderVariants
  children: ReactNode
}

export const Header: FC<Props> = ({ variant = 'h1', children }) => (
  <Typography tagVariant={variant} className={classesByVariant[variant]}>{children}</Typography>
)
