'use client'

import { ExternalLink } from '@/components/Link'
import { Paragraph, Span } from '@/components/Typography'

const BETA_TOOLS_DOCS_URL =
  'https://wiki.rootstockcollective.xyz/Beta-Tools-2c31ca6b0b0280e8aca2cbb74f8d3150#3341ca6b0b02806ebb0fc10a0ef26ef1'

/**
 * Inner content for the BTC Vault prototype disclaimer (no shell).
 * Caller wraps in `StackableBanner` with eligibility/deposit styling.
 */
export function BtcVaultPrototypeBannerContent() {
  return (
    <section data-testid="btc-vault-prototype-banner-content" className="flex w-full flex-col gap-2">
      <Paragraph variant="body-l" className="text-[#171412] leading-[133%]">
        <Span bold>The BTC Vault prototype</Span> is not a live investment product. It is provided solely for
        testing, feedback, and evaluation purposes. Please see the{' '}
        <ExternalLink
          href={BETA_TOOLS_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#171412] text-base leading-[133%] font-bold underline-offset-2"
        >
          Terms and conditions
        </ExternalLink>{' '}
        for more information.
      </Paragraph>
    </section>
  )
}
