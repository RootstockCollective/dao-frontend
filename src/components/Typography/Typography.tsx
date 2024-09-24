import { TypographyTagVariants } from '@/components/Typography/types'
import { cn } from '@/lib/utils'
import { CSSProperties, FC, ReactNode } from 'react'

const classesByTag: Record<TypographyTagVariants, string> = {
  h1: 'font-bold text-[1.7rem]',
  h2: '',
  p: '',
  label: '',
  span: '',
}

interface Props {
  tagVariant: TypographyTagVariants
  children: ReactNode
  className?: string
  fontFamily?: 'sora' | 'kk-topo' | 'rootstock-sans'
  onClick?: () => void
}

export const Typography: FC<Props & CSSProperties> = ({
  tagVariant = 'p',
  children,
  className,
  fontFamily = 'rootstock-sans',
  onClick,
  ...styles
}) => {
  const Component = tagVariant
  const classes = classesByTag[tagVariant]
  const fontFamilyClass = fontFamily ? `font-${fontFamily}` : ''

  return (
    <Component className={cn([fontFamilyClass, classes, className])} style={{ ...styles }} onClick={onClick}>
      {children}
    </Component>
  )
}
