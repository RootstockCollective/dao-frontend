import { ReactNode } from 'react'

export type BannerCategory = 'DAO' | 'TOK'

export interface BannerConfig {
  title: ReactNode
  buttonText: string
  description: string
  category: BannerCategory
  action: {
    url: string
    external: boolean
  }
}

export type BannerConfigMap = {
  [key: string]: BannerConfig
}
