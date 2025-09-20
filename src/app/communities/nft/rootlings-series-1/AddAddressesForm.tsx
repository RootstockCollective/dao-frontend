'use client'

import type { ComponentProps } from 'react'
import { useEffect, useRef } from 'react'
import { type Address, getAddress, isAddress } from 'viem'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/Typography'
import { Button } from '@/components/Button'
import { XCircleIcon } from '@/components/Icons'
import { Trash2 } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useRootlingsS1 } from './useRootlingsS1'
import { Tooltip } from '@/components/Tooltip'

const maxFields = 10
const AddressesSchema = z.object({
  addresses: z
    .array(
      z.object({
        address: z
          .string()
          .trim()
          .min(1, 'Address is required')
          .refine(value => isAddress(value, { strict: false }), 'Invalid Ethereum address')
          .transform(value => getAddress(value)),
      }),
    )
    .nonempty('One address is requires')
    // Check for duplicate addresses
    .superRefine((addresses, ctx) => {
      const addressMap = new Map<string, number[]>()

      addresses.forEach((item, index) => {
        const normalizedAddress = item.address.toLowerCase()
        if (!addressMap.has(normalizedAddress)) {
          addressMap.set(normalizedAddress, [])
        }
        addressMap.get(normalizedAddress)?.push(index)
      })

      // Add errors for all duplicate addresses
      addressMap.forEach(indices => {
        if (indices.length > 1) {
          indices.forEach(index => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Duplicate address',
              path: [index, 'address'],
            })
          })
        }
      })
    }),
})

type AddressesForm = z.infer<typeof AddressesSchema>

/** Form for adding multiple Ethereum addresses to the NFT minter whitelist with validation. */
export function AddAddressesForm(props: ComponentProps<'div'>) {
  const { hasGuardRole, whitelistMinters } = useRootlingsS1()
  const firstInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<AddressesForm>({
    resolver: zodResolver(AddressesSchema),
    defaultValues: {
      addresses: [{ address: '' as Address }],
    },
  })
  const { control, handleSubmit, trigger, clearErrors } = form
  const { append, remove, fields } = useFieldArray<AddressesForm>({ control, name: 'addresses' })

  useEffect(() => {
    // Focus first input on mount
    firstInputRef.current?.focus()
  }, [])

  const handleAddAddress = () => {
    append({ address: '' as Address })
  }

  const handleRemoveAddress = async (index: number) => {
    if (fields.length > 1) {
      remove(index)
      // Clear all address errors first, then revalidate
      clearErrors('addresses')
      await trigger('addresses')
    }
  }

  const onSubmit = (data: AddressesForm) => {
    whitelistMinters(data.addresses.map(({ address }) => address))
  }

  return (
    <div {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Header variant="h3" className="mb-4 text-brand-rootstock-purple">
          Whitelist addresses
        </Header>
        {/* Address inputs stack */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <Controller
                  control={control}
                  name={`addresses.${index}.address`}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <div className="relative">
                        {/* Single Address input */}
                        <input
                          {...field}
                          ref={index === 0 ? firstInputRef : undefined}
                          placeholder="0x..."
                          spellCheck={false}
                          autoComplete="off"
                          className={cn(
                            'w-full h-12 px-4 pr-10 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans border',
                            error ? 'border-error' : 'border-transparent focus:border-brand-rootstock-purple',
                          )}
                        />
                        {/* Clear button */}
                        {field.value && (
                          <button
                            type="button"
                            onClick={async () => {
                              field.onChange('')
                              // Clear all address errors first, then revalidate
                              clearErrors('addresses')
                              await trigger('addresses')
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                            aria-label="Clear input"
                          >
                            <XCircleIcon size={20} className="text-text-100" />
                          </button>
                        )}
                      </div>
                      {/* Address form field error */}
                      {error && <p className="text-error text-sm mt-1">{error.message}</p>}
                    </div>
                  )}
                />
              </div>
              {/* Remove address button */}
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="secondary-outline"
                  onClick={() => handleRemoveAddress(index)}
                  className="p-2 min-w-[40px] h-12 w-12"
                  aria-label={`Remove address ${index + 1}`}
                >
                  <Trash2 size={22} className="text-text-100" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            disabled={fields.length === maxFields}
            type="button"
            variant="secondary-outline"
            onClick={handleAddAddress}
          >
            Add Address
          </Button>

          <Tooltip text={hasGuardRole ? 'Submit addresses' : 'You need guard permissions'}>
            <Button disabled={!hasGuardRole} type="submit" variant="primary">
              Whitelist Minters
            </Button>
          </Tooltip>
        </div>
      </form>
    </div>
  )
}
