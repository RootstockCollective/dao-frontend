import { getEnsDomainName, resolveRnsDomain } from '@/lib/rns'
import { useState, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { type Address, isAddress } from 'viem'

interface Props {
  rnsOrAddressFieldName?: string
  resolvedAddressFieldName?: string
}

/**
 * Hook for RNS domain ↔ Rootstock address resolution in forms.
 *
 * **Form requirements:**
 * - Input field for user entry (RNS domain or address)
 * - Hidden field to store the final resolved address
 * - Both fields must be in the form schema
 *
 * **Behavior:**
 * - User enters "alice.rsk" → resolves to address → stores in hidden field → shows success message
 * - User enters "0x123..." → finds RNS domain → shows info message
 * - Invalid input → sets error on input field
 *
 * @param options.rnsOrAddressFieldName - Input field name (default: 'targetAddressInput')
 * @param options.resolvedAddressFieldName - Hidden field name (default: 'targetAddress')
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
  const [resolutionMsg, setResolutionMsg] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const { watch, setValue, setError, resetField, clearErrors } = useFormContext()
  const targetAddressInput: string = watch(rnsOrAddressFieldName) ?? ''
  const [debouncedInput] = useDebounce(targetAddressInput, 600)

  useEffect(() => {
    if (!debouncedInput.trim() || debouncedInput.length < 3) {
      setResolutionMsg('')
      setIsResolving(false)
      resetField(resolvedAddressFieldName)
      return
    }

    const resolve = async () => {
      setIsResolving(true)
      clearErrors([rnsOrAddressFieldName, resolvedAddressFieldName])
      await new Promise(resolve => setTimeout(resolve, 10))
      try {
        if (debouncedInput.endsWith('.rsk')) {
          try {
            const address = (await resolveRnsDomain(debouncedInput)) as Address
            if (address) {
              setValue(resolvedAddressFieldName, address, { shouldValidate: true, shouldDirty: true }) // fill hidden field
              setResolutionMsg(`✓ Resolves to: ${address}`)
            } else {
              throw new Error()
            }
          } catch (_) {
            throw new Error('RNS domain not found')
          }
        } else if (isAddress(debouncedInput, { strict: false })) {
          setValue(resolvedAddressFieldName, debouncedInput, { shouldValidate: true, shouldDirty: true }) // copy to hidden field
          try {
            const rns = await getEnsDomainName(debouncedInput)
            setResolutionMsg(rns ? `📍 RNS: ${rns}` : '')
          } catch (_error) {
            setResolutionMsg('')
          }
        } else {
          throw new Error('Invalid RNS/address format')
        }
      } catch (error) {
        setError(rnsOrAddressFieldName, {
          message: error instanceof Error ? error.message : 'Invalid RNS/address format',
        })
        setResolutionMsg('')
        resetField(resolvedAddressFieldName)
      } finally {
        setIsResolving(false)
      }
    }

    resolve()
  }, [
    debouncedInput,
    resetField,
    setError,
    setValue,
    clearErrors,
    resolvedAddressFieldName,
    rnsOrAddressFieldName,
  ])

  return useMemo(() => ({ resolutionMsg, isResolving }), [isResolving, resolutionMsg])
}
