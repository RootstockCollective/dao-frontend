import { ReactNode } from 'react'

export interface BannerConfig {
  title: ReactNode
  buttonText: string
  description: string
  action: {
    url: string
    external: boolean
  }
}

export type BannerConfigMap = {
  [key: string]: BannerConfig
} 