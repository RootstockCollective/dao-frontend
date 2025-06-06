import { cn } from '@/lib/utils/utils'
import Image from 'next/image'

export interface TokenImageProps {
  symbol: string
  size?: number
  className?: string
}

export enum TokenSymbol {
  RIF = 'RIF',
  TRIF = 'tRIF',
  STRIF = 'stRIF',
  TRBTC = 'TRBTC',
  RBTC = 'RBTC',
}

export const getIconSource = (symbol: string | undefined): string | null => {
  if (!symbol) {
    return null
  }
  switch (symbol.toUpperCase()) {
    case 'RIF':
    case 'TRIF':
    case 'STRIF':
      return '/images/rif-logo.png'
    case 'RBTC':
    case 'TRBTC':
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
