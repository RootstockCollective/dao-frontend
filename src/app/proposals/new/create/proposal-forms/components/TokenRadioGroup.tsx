'use client'

import { UseFormRegister, FieldValues } from 'react-hook-form'
import { TOKENS, type TokenType, type TokenFormData } from './tokenSchema'
import { cn } from '@/lib/utils'
import { RbtcIcon } from './icons/rbtc'
import { RifIcon } from './icons/rif'
import { ElementType } from 'react'
import { IconProps } from '@/components/Icons'

interface TokenRadioGroupProps<T extends TokenFormData & FieldValues> {
  register: UseFormRegister<T>
  setValue: (name: 'token', value: TokenType) => void
  value: TokenType
  errMsg?: string
}

const tokenIcons: Record<TokenType, ElementType<IconProps>> = {
  rBTC: RbtcIcon,
  RIF: RifIcon,
}

export default function TokenRadioGroup<T extends TokenFormData & FieldValues>({
  setValue,
  value,
  errMsg,
}: TokenRadioGroupProps<T>) {
  return (
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
                onClick={() => setValue('token', token)}
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
      {errMsg && <span className="text-xs text-error font-rootstock-sans">{errMsg}</span>}
    </div>
  )
}
