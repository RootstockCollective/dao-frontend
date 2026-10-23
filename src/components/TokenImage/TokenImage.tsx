import Image from 'next/image'

import { findTokenBySymbol, TOKENS } from '@/lib/tokens'
import { cn } from '@/lib/utils'

/** All supported token symbols */
export type TokenSymbol = (typeof TOKENS)[keyof typeof TOKENS]['symbol']

export interface TokenImageProps {
  symbol: string
  size?: number
  className?: string
  decorative?: boolean
}

export const TokenImage = ({ symbol, size = 16, className, decorative = false }: TokenImageProps) => {
  const token = findTokenBySymbol(symbol)
  if (!token) {
    return null
  }
  return (
    <Image
      src={token.icon}
      alt={decorative ? '' : `${symbol} Logo`}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      className={cn('self-center', className)}
    />
  )
}
