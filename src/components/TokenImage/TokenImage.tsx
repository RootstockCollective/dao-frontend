import { RBTC, RIF, STRIF, USDRIF, USDT0 } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface TokenImageProps {
  symbol: string
  size?: number
  className?: string
}

export enum TokenSymbol {
  RIF = 'RIF',
  STRIF = 'stRIF',
  USDRIF = 'USDRIF',
  RBTC = 'RBTC',
}

const getIconSource = (symbol: string | undefined): string | null => {
  if (!symbol) {
    return null
  }
  switch (symbol.toUpperCase()) {
    case RIF:
    case 'TRIF':
    case STRIF:
      return '/images/rif-logo.png'
    case USDRIF:
      return '/images/usdrif-logo.png'
    case RBTC:
    case 'TRBTC':
      return '/images/rbtc-icon.svg'
    case USDT0:
      return '/images/usdt0-logo.png'
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
