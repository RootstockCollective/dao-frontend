import { Input } from '@/components/Input'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Span } from '@/components/Typography'
import { variantClasses } from '@/components/Typography/Typography'
import { formatCurrency } from '@/lib/utils'
import Big from '@/lib/big'
import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownValue,
} from '@/components/SingleSelectDropdown/SingleSelectDropdown'

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

interface PercentageOption {
  value: number
  label: string
  testId: string
}

const PERCENTAGE_OPTIONS: PercentageOption[] = [
  { value: 0.1, label: '10%', testId: 'swap-percentage-10' },
  { value: 0.2, label: '20%', testId: 'swap-percentage-20' },
  { value: 0.5, label: '50%', testId: 'swap-percentage-50' },
  { value: 1, label: 'Max', testId: 'swap-percentage-max' },
]

const shimmerVariants: Variants = {
  start: { backgroundPosition: '0% 0%' },
  end: {
    backgroundPosition: '-200% 0%',
    transition: {
      duration: 1.2,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
  backgroundSize: '200% 100%',
} as const

const SwapInputSkeleton = () => (
  <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60" data-testid="swap-input-skeleton">
    <motion.div
      className="h-4 mb-3 w-32"
      style={shimmerStyle}
      variants={shimmerVariants}
      initial="start"
      animate="end"
    />
    <div className="flex gap-2">
      <motion.div
        className="h-12 flex-1"
        style={shimmerStyle}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />
      <motion.div
        className="w-24 h-12"
        style={shimmerStyle}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />
    </div>
  </div>
)

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

    if (isLoading) {
      return <SwapInputSkeleton />
    }

    const handleTokenSelect = (symbol: string) => {
      const token = tokens.find(t => t.symbol === symbol)
      if (token) {
        onTokenChange(token)
      }
    }

    return (
      <div data-testid="swap-input-component">
        <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
          {labelText && (
            <Label className="mb-3" data-testid="swap-input-label">
              {labelText}
            </Label>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              name="swap-amount-input"
              type="number"
              value={amount}
              onChange={onAmountChange}
              className={cn('grow', variantClasses.h1, errorText ? 'text-error' : '')}
              data-testid="swap-amount-input"
              placeholder="0"
              readonly={readonly}
              inputProps={{ decimalScale: selectedToken.decimals || 18 }}
            />
            <div className="flex items-center shrink-0" data-testid="swap-token-selector">
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
            </div>
          </div>
          {amountToCurrency && (
            <Paragraph variant="body-s" className="text-bg-0" data-testid="swap-currency-value">
              {amountToCurrency}
            </Paragraph>
          )}
          {errorText && (
            <div className="flex items-center gap-2 mt-2" data-testid="swap-error-text">
              <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
              <Paragraph className="text-error">{errorText}</Paragraph>
            </div>
          )}
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
            {onPercentageClick && balance && (
              <div className="flex gap-1 self-end" data-testid="swap-percentage-buttons">
                {PERCENTAGE_OPTIONS.map(({ value, label, testId }) => (
                  <Button
                    key={value}
                    variant="secondary"
                    onClick={() => onPercentageClick(value)}
                    className="bg-transparent border border-bg-40 px-2 py-0"
                    data-testid={testId}
                    disabled={readonly}
                  >
                    <Span variant="body-s">{label}</Span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

SwapInputComponent.displayName = 'SwapInputComponent'
