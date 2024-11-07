import { isAddress } from 'viem'
import { Span } from '@/components/Typography'
import { cn, shortAddress } from '@/lib/utils'
import { withCopy } from './withCopy'

export interface AddressProps {
  addressOrAlias: string
  className?: string
}

export const AddressOrAlias: React.FC<AddressProps> = ({ addressOrAlias, className = '' }) => {
  const addressClass = 'font-normal text-base leading-none text-text-primary'
  const aliasClass = 'text-sm line-clamp-1'

  return (
    <>
      {isAddress(addressOrAlias) ? (
        <Span className={cn(addressClass, className)}>{shortAddress(addressOrAlias)}</Span>
      ) : (
        <Span className={cn(aliasClass, className)}>{addressOrAlias}</Span>
      )}
    </>
  )
}

export const AddressOrAliasWithCopy = withCopy(AddressOrAlias)
