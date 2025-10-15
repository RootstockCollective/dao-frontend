import { RBTC, RIF, STRIF, TokenSymbol, USDRIF } from '@/lib/tokens'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface TokenImageProps {
  symbol: TokenSymbol
  size?: number
  className?: string
}

const getIconSource = (symbol: TokenSymbol | undefined): string | null => {
  if (!symbol) {
    return null
  }
  switch (symbol.toUpperCase()) {
    case RIF:
    case STRIF:
      return '/images/rif-logo.png'
    case USDRIF:
      return '/images/usdrif-logo.png'
    case RBTC:
      return '/images/rbtc-icon.svg'
    default:
      return null
  }
}

export const TokenImage = ({ symbol, size = 16, className }: TokenImageProps) => {
  const imageSource = getIconSource(symbol)
  if (!imageSource) {
    return null
  }
  return (
    <Image
      src={imageSource}
      alt={`${symbol} Logo`}
      width={size}
      height={size}
      className={cn('self-center', className)}
    />
  )
}
