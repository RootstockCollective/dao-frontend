import { Span } from '@/components/TypographyNew'
import { CopyButton } from '@/components/CopyButton'
import { shortAddress, shortProposalId } from '@/lib/utils'

export const ShortenAndCopy = ({ value }: { value: string | number }) => {
  if (!value) return null
  const str = value.toString()
  // Use shortAddress logic for addresses, otherwise shorten long IDs
  const isAddress = str.startsWith('0x') && str.length >= 10
  const display = isAddress ? shortAddress(str) : shortProposalId(str)

  return <CopyButton copyText={display} className="justify-start" />
}
