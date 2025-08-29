'use client'
import { FC, ReactNode } from 'react'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { HeroComponentMobile } from './HeroComponentMobile'
import { HeroComponentDesktop } from './HeroComponentDesktop'

export interface HeroComponentProps {
  imageSrc: string
  title: string
  subtitle: string
  topText?: string
  items?: string[]
  content?: ReactNode
  button?: ReactNode
  className?: string
  dataTestId?: string
}

export const HeroComponent: FC<HeroComponentProps> = ({
  imageSrc,
  title,
  subtitle,
  topText,
  items = [],
  content,
  button,
  className,
  dataTestId,
}) => {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <HeroComponentDesktop
        imageSrc={imageSrc}
        title={title}
        subtitle={subtitle}
        topText={topText}
        items={items}
        content={content}
        button={button}
        className={className}
        dataTestId={dataTestId}
      />
    )
  }

  return (
    <HeroComponentMobile
      title={title}
      subtitle={subtitle}
      topText={topText}
      items={items}
      content={content}
      button={button}
      className={className}
      dataTestId={dataTestId}
    />
  )
}
