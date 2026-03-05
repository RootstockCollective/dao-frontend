import type { ReactNode } from 'react'

/**
 * Shared disclosure list content for the BTC Vault.
 * Renders the five disclosure bullets with specified bold segments.
 * Used in both the disclosure section (bottom, when connected) and the disclosure banner (top, when disconnected).
 */

const DISCLOSURE_LIST_CLASS =
  'list-disc pl-5 space-y-2 font-rootstock-sans font-normal text-base leading-[150%]'

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

export const DisclosureContent = () => (
  <ul
    className={DISCLOSURE_LIST_CLASS}
    style={{ color: 'var(--Text-100, #FFF)' }}
    data-testid="DisclosureContent"
  >
    {disclosureItems.map((item, index) => (
      <li key={index}>{item.content}</li>
    ))}
  </ul>
)
