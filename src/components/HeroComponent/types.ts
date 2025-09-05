import { ReactNode } from 'react'

export interface HeroComponentMobileProps {
  title: string
  subtitle: string
  topText?: string
  items?: ReactNode[]
  content?: ReactNode
  button?: ReactNode
  className?: string
  dataTestId?: string
}

export interface HeroComponentProps extends HeroComponentMobileProps {
  imageSrc: string
}
