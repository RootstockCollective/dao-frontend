'use client'

import { Controller, Control, FieldPath } from 'react-hook-form'
import { SYMBOLS, type TokenFormData } from '../schemas/TokenSchema'
import { cn } from '@/lib/utils'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'

interface TokenRadioGroupProps<T extends TokenFormData> {
  name: FieldPath<T>
  control: Control<T>
}

export default function TokenRadioGroup<T extends TokenFormData>({ name, control }: TokenRadioGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <ul
            className="flex flex-row justify-around gap-2 @md:gap-6"
            role="radiogroup"
            aria-label="Select token"
          >
            {SYMBOLS.map(symbol => (
              <li key={symbol}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={value === symbol}
                  onClick={() => onChange(symbol)}
                  className={cn(
                    'group focus:outline-none focus-visible:outline-none',
                    'flex gap-2 items-center',
                  )}
                  data-testid={`TokenRadio-${symbol}`}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full transition-all border-text-100 shrink-0',
                      value !== symbol && 'group-focus:outline group-focus:outline-text-100',
                      value === symbol ? 'border-5' : 'border-[1.5px]',
                    )}
                  />
                  <span className="text-lg font-bold whitespace-nowrap">
                    <TokenImage symbol={symbol} className="inline-block mb-[2px] mr-1" />
                    {symbol}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <Span variant="body-xs" className="text-error">
              {error.message}
            </Span>
          )}
        </>
      )}
    />
  )
}
