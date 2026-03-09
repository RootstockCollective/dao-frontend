'use client'

import { KotoQuestionMarkIcon } from '@/components/Icons'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { Tooltip } from '@/components/Tooltip'
import { Header, Label } from '@/components/Typography'
import { BTC_VAULT_ADDRESS } from '@/lib/constants'

import { CONTRACT_ADDRESSES_TOOLTIP_MAP } from './CapitalAllocationSection.constants'

/**
 * Displays vault address and share token contract with copy and tooltips.
 * Renders inside the Capital Allocation section of the BTC Vault.
 */
export function ContractAddressesSection() {
  return (
    <div
      data-testid="capital-allocation-contract-addresses"
      className="flex flex-col gap-4 mt-10 border-t border-bg-60 pt-8"
    >
      <Header variant="h4" className="text-text-100">
        CONTRACT ADDRESSES
      </Header>
      <div className="flex flex-wrap gap-4 md:gap-0">
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <div className="flex min-w-0 flex-col gap-2 md:min-w-[180px]">
            <div className="flex items-center gap-2">
              <Label variant="tag" className="text-bg-0">
                Vault address
              </Label>
              <Tooltip text={CONTRACT_ADDRESSES_TOOLTIP_MAP.vaultAddress}>
                <span className="cursor-help" data-testid="tooltip-vault-address">
                  <KotoQuestionMarkIcon className="mb-1" />
                </span>
              </Tooltip>
            </div>
            {BTC_VAULT_ADDRESS ? (
              <ShortenAndCopy
                value={BTC_VAULT_ADDRESS}
                className="text-bg-0"
                data-testid="vault-address-copy"
              />
            ) : (
              'TBD'
            )}
          </div>
        </div>
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <div className="flex min-w-0 flex-col gap-2 md:min-w-[180px]">
            <div className="flex items-center gap-2">
              <Label variant="tag" className="text-bg-0">
                Share token contract
              </Label>
              <Tooltip text={CONTRACT_ADDRESSES_TOOLTIP_MAP.shareTokenContract}>
                <span className="cursor-help" data-testid="tooltip-share-token">
                  <KotoQuestionMarkIcon className="mb-1" />
                </span>
              </Tooltip>
            </div>
            {BTC_VAULT_ADDRESS ? (
              <ShortenAndCopy
                value={BTC_VAULT_ADDRESS}
                className="text-bg-0"
                data-testid="share-token-address-copy"
              />
            ) : (
              'TBD'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
