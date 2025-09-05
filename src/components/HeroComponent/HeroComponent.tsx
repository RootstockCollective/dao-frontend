'use client'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { HeroComponentMobile } from './HeroComponentMobile'
import { HeroComponentDesktop } from './HeroComponentDesktop'
import { HeroComponentProps } from './type'

export const HeroComponent = (props: HeroComponentProps) => {
  const isDesktop = useIsDesktop()

  return isDesktop ? <HeroComponentDesktop {...props} /> : <HeroComponentMobile {...props} />
}
