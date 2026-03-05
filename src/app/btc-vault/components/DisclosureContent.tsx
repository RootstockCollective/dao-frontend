import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Shared disclosure list content for the BTC Vault.
 * Renders the five disclosure bullets with specified bold segments.
 * Used in both the disclosure section (bottom, when connected) and the disclosure banner (top, when disconnected).
 */

const DISCLOSURE_LIST_BASE = 'list-disc pl-5 font-rootstock-sans font-normal text-base leading-[150%]'

const LIST_ITEM_SPACING = 'space-y-1'

const disclosureItems: Array<{ content: ReactNode }> = [
  {
    content: (
      <>
        APY and earnings are <strong>estimated</strong> and not guaranteed.
      </>
    ),
  },
  {
    content: (
      <>
        Yield is automatically compounded into the vault <strong>NAV</strong>.
      </>
    ),
  },
  {
    content: (
      <>
        Earnings are reflected in the value of your shares <strong>over time</strong>.
      </>
    ),
  },
  {
    content: (
      <>
        Deposits/withdrawals are <strong>requests</strong> and require approval.
      </>
    ),
  },
  {
    content: <>Execution may be delayed/batched by epoch.</>,
  },
]

export type DisclosureContentVariant = 'section' | 'banner'

interface DisclosureContentProps {
  variant?: DisclosureContentVariant
}

const variantStyles: Record<DisclosureContentVariant, { color: string; spacing: string }> = {
  section: { color: 'var(--Text-100, #FFF)', spacing: LIST_ITEM_SPACING },
  banner: { color: 'var(--Background-100, #171412)', spacing: LIST_ITEM_SPACING },
}

export const DisclosureContent = ({ variant = 'section' }: DisclosureContentProps) => {
  const { color, spacing } = variantStyles[variant]
  return (
    <ul className={cn(DISCLOSURE_LIST_BASE, spacing)} style={{ color }} data-testid="DisclosureContent">
      {disclosureItems.map((item, index) => (
        <li key={index}>{item.content}</li>
      ))}
    </ul>
  )
}
