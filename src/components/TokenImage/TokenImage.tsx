import { cn } from '@/lib/utils'
import { findTokenBySymbol, TOKENS } from '@/lib/tokens'
import Image from 'next/image'

/** All supported token symbols */
export type TokenSymbol = (typeof TOKENS)[keyof typeof TOKENS]['symbol']

export interface TokenImageProps {
  symbol: string
  size?: number
  className?: string
}

export const TokenImage = ({ symbol, size = 16, className }: TokenImageProps) => {
  const token = findTokenBySymbol(symbol)
  if (!token) {
    return null
  }
  return (
    <Image
      src={token.icon}
      alt={`${symbol} Logo`}
      width={size}
      height={size}
      className={cn('self-center', className)}
    />
  )
}
