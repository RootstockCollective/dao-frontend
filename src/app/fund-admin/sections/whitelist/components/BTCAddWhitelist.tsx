'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { getAddress, isAddress } from 'viem'

import { Button } from '@/components/Button'
import { TransactionInProgressButton } from '@/components/StepActionButtons'
import { Paragraph } from '@/components/Typography'
import { executeTxFlow } from '@/shared/notification'

import { useGrantWhitelistedUserRole } from '../hooks/useGrantWhitelistedUserRole'
import { type BTCAddWhitelistForm, btcAddWhitelistSchema } from '../schema'
import { WhitelistAddressInput } from './GrantWhitelistAddressInput'

export type { BTCAddWhitelistForm }

interface BTCAddWhitelistProps {
  /** Same refetch as de-whitelist success: refresh whitelist table data. */
  onGrantSuccess?: () => void
}

export function BTCAddWhitelist({ onGrantSuccess }: BTCAddWhitelistProps) {
  const methods = useForm<BTCAddWhitelistForm>({
    resolver: zodResolver(btcAddWhitelistSchema),
    defaultValues: {
      walletAddressInput: '',
      walletAddress: '',
      walletAddressError: '',
      walletAddressRNS: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, formState, reset } = methods

  const walletAddressRaw = useWatch({ control, name: 'walletAddress' })
  const account = useMemo((): `0x${string}` | null => {
    if (!walletAddressRaw || !isAddress(walletAddressRaw, { strict: false })) return null
    return getAddress(walletAddressRaw)
  }, [walletAddressRaw])

  const { onRequestTransaction, isRequesting, isTxPending, canSubmit } = useGrantWhitelistedUserRole(account)

  const onSubmit = useCallback(() => {
    if (!canSubmit) return
    void executeTxFlow({
      action: 'btcVaultWhitelistGrant',
      onRequestTx: onRequestTransaction,
      onSuccess: () => {
        reset({
          walletAddressInput: '',
          walletAddress: '',
          walletAddressError: '',
          walletAddressRNS: '',
        })
        onGrantSuccess?.()
      },
    })
  }, [canSubmit, onGrantSuccess, onRequestTransaction, reset])

  const addDisabled = !formState.isValid || !canSubmit || isRequesting

  const buttonLabel = isRequesting ? 'Signing...' : 'Add to whitelist'

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-[530px] mx-auto">
        <Paragraph variant="body-l" className="text-center">
          Add an address to whitelist
        </Paragraph>

        <WhitelistAddressInput control={control} disabled={isRequesting} />

        <div className="flex justify-center">
          {isTxPending ? (
            <TransactionInProgressButton />
          ) : (
            <Button variant="primary" type="submit" data-testid="AddToWhitelistButton" disabled={addDisabled}>
              {buttonLabel}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
