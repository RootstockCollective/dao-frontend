import { Input } from '@/components/Input'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph } from '@/components/Typography'
import { variantClasses } from '@/components/Typography/Typography'
import { formatCurrency } from '@/lib/utils'
import Big from '@/lib/big'
import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownValue,
} from '@/components/SingleSelectDropdown/SingleSelectDropdown'
import { PercentageButtons } from '@/components/PercentageButtons'

/**
 * Token information for swap input
 */
export interface SwapInputToken {
  symbol: string
  address: string
  name: string
  decimals?: number
  price?: number // Token price in USD for calculating fiat value
}

interface Props {
  tokens: SwapInputToken[]
  selectedToken: SwapInputToken
  onTokenChange: (token: SwapInputToken) => void
  amount: string
  onAmountChange: (value: string) => void
  balance?: string
  onPercentageClick?: (percentage: number) => void
  isLoading?: boolean
  readonly?: boolean
  labelText?: string
  errorText?: string
}

export const SwapInputComponent = forwardRef<HTMLInputElement, Props>(
  (
    {
      tokens,
      selectedToken,
      onTokenChange,
      amount,
      onAmountChange,
      balance,
      onPercentageClick,
      isLoading = false,
      readonly = false,
      labelText,
      errorText,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    useEffect(() => {
      if (!readonly && inputRef?.current) {
        inputRef.current.focus()
      }
    }, [readonly, inputRef])

    // Calculate currency value only if we have a valid price and amount
    const amountToCurrency = useMemo(() => {
      const tokenPrice = selectedToken.price
      if (tokenPrice && tokenPrice > 0 && amount) {
        return formatCurrency(Big(tokenPrice).mul(amount || 0))
      }
      return undefined
    }, [selectedToken.price, amount])

    const handleTokenSelect = (symbol: string) => {
      const token = tokens.find(t => t.symbol === symbol)
      if (token) {
        onTokenChange(token)
      }
    }

    return (
      <div data-testid="swap-input-component">
        <div className="flex py-3 px-4 rounded-1 w-full bg-bg-60 gap-2">
          {/* Left side: label + input + currency stacked */}
          <div className="flex flex-col flex-1">
            {labelText && (
              <Label className="mb-3" data-testid="swap-input-label">
                {labelText}
              </Label>
            )}
            <Input
              ref={inputRef}
              name="swap-amount-input"
              type="number"
              value={amount}
              onChange={onAmountChange}
              className={cn(
                'grow',
                variantClasses.h1,
                errorText ? 'text-error' : '',
                isLoading && 'animate-pulse text-text-60',
              )}
              data-testid="swap-amount-input"
              placeholder="0"
              readonly={readonly || isLoading}
              inputProps={{ decimalScale: selectedToken.decimals || 18 }}
            />
            <Paragraph
              variant="body-s"
              className={cn(
                'text-bg-0',
                isLoading && 'animate-pulse text-text-60',
                !amountToCurrency && !isLoading && 'invisible',
              )}
              data-testid="swap-currency-value"
            >
              {amountToCurrency || '\u00A0'}
            </Paragraph>
            {errorText && (
              <div className="flex items-center gap-2 mt-2" data-testid="swap-error-text">
                <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
                <Paragraph className="text-error">{errorText}</Paragraph>
              </div>
            )}
          </div>
          {/* Right side: token centered vertically in full container */}
          <div className="flex items-center shrink-0" data-testid="swap-token-selector">
            {tokens.length === 1 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-v3-bg-accent-60 rounded min-w-[120px]">
                <TokenImage symbol={selectedToken.symbol} size={24} />
                <Paragraph className="font-semibold">{selectedToken.symbol}</Paragraph>
              </div>
            ) : (
              <Dropdown value={selectedToken.symbol} onValueChange={handleTokenSelect} disabled={readonly}>
                <DropdownTrigger className="min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <TokenImage symbol={selectedToken.symbol} size={24} />
                    <DropdownValue placeholder="Select token">{selectedToken.symbol}</DropdownValue>
                  </div>
                </DropdownTrigger>
                <DropdownContent>
                  {tokens.map(token => (
                    <DropdownItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <TokenImage symbol={token.symbol} size={20} />
                        <span>{token.symbol}</span>
                      </div>
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            )}
          </div>
        </div>

        {(balance !== undefined || onPercentageClick) && (
          <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
            {balance !== undefined && (
              <div className="flex items-center gap-1" data-testid="swap-balance-label">
                <TokenImage symbol={selectedToken.symbol} size={12} />
                <Label variant="body-s" className="text-text-60">
                  {selectedToken.symbol} balance: {balance}
                </Label>
              </div>
            )}
            {onPercentageClick && balance && !readonly && (
              <div className="self-end">
                <PercentageButtons onPercentageClick={onPercentageClick} testId="swap-percentage-buttons" />
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

SwapInputComponent.displayName = 'SwapInputComponent'
