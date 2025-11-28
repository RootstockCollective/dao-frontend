import { getEnsDomainName, resolveRnsDomain } from '@/lib/rns'
import { useState, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { type Address, isAddress } from 'viem'

interface Props {
  rnsOrAddressFieldName?: string
  resolvedAddressFieldName?: string
  rnsFieldName?: string
  errorFieldName?: string
}

/**
 * Hook for RNS domain ↔ Rootstock address resolution in forms.
 *
 * **Form requirements:**
 * - Input field for user entry (RNS domain or address)
 * - Hidden field to store the final resolved address
 * - Both fields must be in the form schema
 * - Zod schema should validate that targetAddress is filled when targetAddressInput is valid
 *
 * **Behavior:**
 * - User enters "alice.rsk" → resolves to address → stores in hidden field → shows success message
 * - User enters "0x123..." → finds RNS domain → shows info message
 * - Invalid input → clears hidden field and sets error in hidden error field
 *
 * @param options.rnsOrAddressFieldName - Input field name (default: 'targetAddressInput')
 * @param options.resolvedAddressFieldName - Hidden field name (default: 'targetAddress')
 * @param options.errorFieldName - Hidden field for error messages (default: 'targetAddressError')
 * @returns `{ resolutionMsg, isResolving }` - UI message and loading state
 *
 * @example
 * ```tsx
 * // Schema: { targetAddressInput: string, targetAddress: string }
 * const { resolutionMsg, isResolving } = useFormAddressResolution()
 *
 * <TextInput name="targetAddressInput" />
 * <input type="hidden" {...register('targetAddress')} />
 * {resolutionMsg && <div>{resolutionMsg}</div>}
 * ```
 */
export function useFormAddressResolution(props?: Props) {
  const resolvedAddressFieldName = props?.resolvedAddressFieldName ?? 'targetAddress'
  const rnsOrAddressFieldName = props?.rnsOrAddressFieldName ?? 'targetAddressInput'
  const rnsFieldName = props?.rnsFieldName ?? 'targetAddressRNS'
  const errorFieldName = props?.errorFieldName ?? 'targetAddressError'
  const [resolutionMsg, setResolutionMsg] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const { watch, setValue, trigger } = useFormContext()
  const targetAddressInput: string = watch(rnsOrAddressFieldName) ?? ''
  const [debouncedInput] = useDebounce(targetAddressInput, 600)

  useEffect(() => {
    if (!debouncedInput.trim() || debouncedInput.length < 3) {
      setResolutionMsg('')
      setIsResolving(false)
      setValue(resolvedAddressFieldName, '')
      setValue(rnsFieldName, '')
      setValue(errorFieldName, '', { shouldValidate: true }) // Clear error on reset
      return
    }

    const resolve = async () => {
      setIsResolving(true)
      try {
        // Clear previous error before attempting to resolve
        setValue(errorFieldName, '', { shouldValidate: true })

        if (debouncedInput.endsWith('.rsk')) {
          const address = (await resolveRnsDomain(debouncedInput)) as Address
          if (address) {
            setValue(rnsFieldName, debouncedInput, { shouldDirty: true })
            setValue(resolvedAddressFieldName, address, { shouldValidate: true, shouldDirty: true })
            setResolutionMsg(`✓ Resolves to: ${address}`)
            // Trigger validation to force re-render and show message
            //trigger(rnsOrAddressFieldName)
          } else {
            throw new Error('RNS domain not found')
          }
        } else if (isAddress(debouncedInput, { strict: false })) {
          setValue(resolvedAddressFieldName, debouncedInput, { shouldValidate: true, shouldDirty: true })
          try {
            const rns = await getEnsDomainName(debouncedInput)
            setResolutionMsg(rns ? `📍 RNS: ${rns}` : '')
            setValue(rnsFieldName, rns ?? '')
            // Trigger validation to force re-render and show message
            //trigger(rnsOrAddressFieldName)
          } catch (_error) {
            setResolutionMsg('')
          }
        } else {
          throw new Error('Invalid RNS/address format')
        }
      } catch (error) {
        // On failure, clear resolved address and set error message in hidden field
        setValue(resolvedAddressFieldName, '', { shouldDirty: true })
        setValue(rnsFieldName, '')
        const message = error instanceof Error ? error.message : 'Invalid RNS/address format'
        setValue(errorFieldName, message, { shouldValidate: true }) // Set error and trigger validation
        setResolutionMsg('')
      } finally {
        // Trigger validation to force re-render and show message
        trigger(rnsOrAddressFieldName)
        setIsResolving(false)
      }
    }

    resolve()
  }, [
    debouncedInput,
    setValue,
    resolvedAddressFieldName,
    rnsFieldName,
    errorFieldName,
    trigger,
    rnsOrAddressFieldName,
  ])

  return useMemo(() => ({ resolutionMsg, isResolving }), [isResolving, resolutionMsg])
}
