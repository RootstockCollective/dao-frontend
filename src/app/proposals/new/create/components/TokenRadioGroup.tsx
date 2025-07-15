'use client'

import { Controller, Control, FieldPath } from 'react-hook-form'
import { TOKENS, type TokenFormData } from '../schemas/TokenSchema'
import { cn } from '@/lib/utils'
import { TokenIcon } from '@/app/proposals/icons/TokenIcon'

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
        <div className="flex flex-col gap-2">
          <ul className="flex gap-6" role="radiogroup" aria-label="Select token">
            {TOKENS.map(token => (
              <li key={token}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={value === token}
                  onClick={() => onChange(token)}
                  className={cn(
                    'group focus:outline-none focus-visible:outline-none',
                    'flex gap-2 items-center',
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full transition-all border-text-100',
                      value !== token && 'group-focus:outline group-focus:outline-text-100',
                      value === token ? 'border-5' : 'border-[1.5px]',
                    )}
                  />
                  <span className="text-lg font-bold whitespace-nowrap">
                    <TokenIcon token={token} className="mb-[2px] mr-1" />
                    {token}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {error && <span className="text-xs text-error font-rootstock-sans">{error.message}</span>}
        </div>
      )}
    />
  )
}
