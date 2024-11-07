import { Address, isAddress } from 'viem'
import { Span } from '@/components/Typography'
import { cn, shortAddress } from '@/lib/utils'
import { withCopy } from './withCopy'

export interface AddressProps {
  addressOrAlias: string
  className?: string
}

export const AddressOrAlias: React.FC<AddressProps> = ({ addressOrAlias, className = '' }) => {

  const key = isAddress(addressOrAlias)? 'address': 'alias';

  const addressClass = 'font-normal text-base leading-none text-text-primary'
  const aliasClass = 'text-sm line-clamp-1'

  const renderedComponent = {
    'alias': <Span className={cn(aliasClass, className)}>{addressOrAlias}</Span>,
    'address': <Span className={cn(addressClass, className)}>{shortAddress(addressOrAlias as Address)}</Span>
  }

  return renderedComponent[key];
}

export const AddressOrAliasWithCopy = withCopy(AddressOrAlias)
