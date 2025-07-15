import { CopySvg } from '@/components/CopySvg'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Span } from '@/components/TypographyNew'
import { EXPLORER_URL } from '@/lib/constants'
import { cn, shortAddress } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

const BASE_CLASSNAME = 'hover:text-text-60 transition-colors duration-100'

export function AddressLink({ address, className }: { address: Address; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  return (
    <div className={cn('flex flex-col md:flex-row items-center gap-5 w-full', className)}>
      <button
        onClick={handleCopy}
        className="hover:cursor-pointer transition-colors duration-100 flex flex-row items-center gap-1.5"
        aria-label="Copy address"
      >
        <Span variant="body-s" className={cn(BASE_CLASSNAME, 'text-bg-0')}>
          {shortAddress(address, 6)}
        </Span>
        <CopySvg color={copied ? '#22AD5C' : 'white'} />
      </button>

      <a
        href={`${EXPLORER_URL}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 underline-thick flex flex-row items-center gap-1"
      >
        <Span variant="body-s">View details in Explorer</Span>
        <ArrowUpRightLightIcon size={20} />
      </a>
    </div>
  )
}
