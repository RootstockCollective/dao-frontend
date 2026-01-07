import { CopyButton } from '@/components/CopyButton'
import { cn, shortAddress, shortProposalId } from '@/lib/utils'
import { Address } from 'viem'
import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: string | number
}

export const ShortenAndCopy = ({ value, className, ...props }: Props) => {
  if (!value) return null
  const str = value.toString()
  // Use shortAddress logic for addresses, otherwise shorten long IDs
  const isAddress = str.startsWith('0x') && str.length >= 10
  const display = isAddress ? shortAddress(str as Address) : shortProposalId(str)

  return (
    <CopyButton copyText={str} className={cn('justify-start', className)} {...props}>
      {display}
    </CopyButton>
  )
}
