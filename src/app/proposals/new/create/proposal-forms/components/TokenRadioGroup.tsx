'use client'

import { Controller, Control, FieldPath } from 'react-hook-form'
import { TOKENS, type TokenType, type TokenFormData } from './tokenSchema'
import { cn } from '@/lib/utils'
import { RbtcIcon } from './icons/rbtc'
import { RifIcon } from './icons/rif'
import { ElementType } from 'react'
import { IconProps } from '@/components/Icons'

interface TokenRadioGroupProps<T extends TokenFormData> {
  name: FieldPath<T>
  control: Control<T>
}

const tokenIcons: Record<TokenType, ElementType<IconProps>> = {
  rBTC: RbtcIcon,
  RIF: RifIcon,
}

export default function TokenRadioGroup<T extends TokenFormData>({ name, control }: TokenRadioGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          <ul className="flex gap-6" role="radiogroup" aria-label="Select token">
            {TOKENS.map(token => {
              const TokenIcon = tokenIcons[token]
              return (
                <li key={token}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={value === token}
                    onClick={() => onChange(token)}
                    className={cn(
                      'group focus:outline-none focus-visible:outline-none',
                      'flex gap-1 items-center',
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full transition-all border-text-100',
                        value !== token && 'group-focus:outline group-focus:outline-text-100',
                        value === token ? 'border-5' : 'border-[1.5px]',
                      )}
                    />
                    <TokenIcon />
                    <p className="text-lg font-rootstock-sans font-bold leading-normal">{token}</p>
                  </button>
                </li>
              )
            })}
          </ul>
          {error && <span className="text-xs text-error font-rootstock-sans">{error.message}</span>}
        </div>
      )}
    />
  )
}
