'use client'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { HeroComponentDesktop } from './HeroComponentDesktop'
import { HeroComponentMobile } from './HeroComponentMobile'
import { HeroComponentProps } from './types'

export const HeroComponent = (props: HeroComponentProps) => {
  const isDesktop = useIsDesktop()

  return isDesktop ? <HeroComponentDesktop {...props} /> : <HeroComponentMobile {...props} />
}
