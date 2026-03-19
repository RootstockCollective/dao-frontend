'use client'

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownValue,
} from '@/components/SingleSelectDropdown/SingleSelectDropdown'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC, WRBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { SelectedToken } from '../hooks/useTokenSelection'

const TOKEN_OPTIONS: { value: SelectedToken; label: string }[] = [
  { value: RBTC, label: RBTC },
  { value: WRBTC, label: WRBTC },
]

interface Props {
  selectedToken: SelectedToken
  onTokenChange: (token: SelectedToken) => void
}

/**
 * Dropdown-style selector for choosing between native RBTC (symbol from env via `RBTC`) and WrBTC.
 * Both tokens share the same icon (`RBTC` constant for TokenImage).
 * Uses shared SingleSelectDropdown (Radix Select) for consistency with Swap token selector.
 * When inside a modal, the dropdown list portals into the modal container (via SingleSelectDropdown context).
 */
export const TokenSelector = ({ selectedToken, onTokenChange }: Props) => (
  <Dropdown value={selectedToken} onValueChange={value => onTokenChange(value as SelectedToken)}>
    <DropdownTrigger
      className={cn(
        'w-auto min-w-[100px] shrink-0 px-2 py-1.5 gap-2',
        'text-text-100 font-bold font-rootstock-sans',
      )}
      data-testid="TokenSelector"
    >
      <div className="flex items-center gap-2">
        <TokenImage symbol={RBTC} size={24} />
        <DropdownValue placeholder="Select token">
          <Span variant="body-l" bold>
            {selectedToken}
          </Span>
        </DropdownValue>
      </div>
    </DropdownTrigger>
    <DropdownContent>
      {TOKEN_OPTIONS.map(opt => (
        <DropdownItem key={opt.value} value={opt.value}>
          <div className="flex items-center gap-2">
            <TokenImage symbol={RBTC} size={20} />
            <Span bold>{opt.label}</Span>
          </div>
        </DropdownItem>
      ))}
    </DropdownContent>
  </Dropdown>
)
