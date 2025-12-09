import { useCallback } from 'react'
import { Label, Span } from '@/components/Typography'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { DEFAULT_SLIPPAGE_PERCENTAGE } from '../utils/slippage'

interface Props {
  value: string
  onChange: (value: string) => void
  name?: string
}

export const SlippageInput = ({ value, onChange, name = 'slippage-input' }: Props) => {
  const handleSlippageChange = useCallback(
    (inputValue: string) => {
      // Allow empty string and valid numbers
      if (inputValue === '' || (!isNaN(parseFloat(inputValue)) && parseFloat(inputValue) >= 0)) {
        onChange(inputValue)
      }
    },
    [onChange],
  )

  const handleResetSlippage = useCallback(() => {
    onChange(DEFAULT_SLIPPAGE_PERCENTAGE.toString())
  }, [onChange])

  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-bg-40">
      <Label variant="body-s" className="text-text-60">
        Slippage:
      </Label>
      <div className="flex items-center gap-1 p-2">
        <div className="relative">
          <Input
            name={name}
            type="number"
            value={value}
            onChange={handleSlippageChange}
            className="w-18 text-right text-sm bg-bg-80 p-2 rounded pr-6"
            inputProps={{
              decimalScale: 2,
              min: 0,
              max: 10,
              step: 0.01,
            }}
          />
          <Span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-text-60 pointer-events-none">
            %
          </Span>
        </div>
        <Button
          variant="transparent"
          onClick={handleResetSlippage}
          className="ml-1 px-2 py-1 text-xs"
          textClassName="font-normal"
        >
          Reset to default
        </Button>
      </div>
    </div>
  )
}
