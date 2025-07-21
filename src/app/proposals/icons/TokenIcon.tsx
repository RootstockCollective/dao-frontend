import { RbtcIcon } from './RbtcIcon'
import { RifIcon } from './RifIcon'
import type { TokenType } from '../new/details/components'
import { IconProps } from '@/components/Icons'
import { cn } from '@/lib/utils'

interface Props extends IconProps {
  token: TokenType
}

export function TokenIcon({ token, className, ...props }: Props) {
  const TokenComponent = {
    rBTC: RbtcIcon,
    RIF: RifIcon,
  }[token]
  return <TokenComponent className={cn('inline-block', className)} {...props} />
}
