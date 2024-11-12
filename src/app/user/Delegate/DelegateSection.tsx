'use client'
import { HeaderTitle } from '@/components/Typography'
import { Button } from '@/components/Button'
import { DelegateModal } from '@/app/user/Delegate/DelegateModal'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { Hash } from 'viem'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'

export const DelegateSection = () => {
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [hash, setHash] = useState<Hash | undefined>(undefined)

  const { setMessage: setGlobalMessage } = useAlertContext()

  const onDelegateTxStarted = (hash: string) => {
    setHash(hash as Hash)
  }

  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    console.log(24, { isSuccess })
    if (isSuccess) {
      setGlobalMessage(TX_MESSAGES.delegation.success)
    }
  }, [isSuccess, setGlobalMessage])

  return (
    <div>
      {/* Header Components*/}
      <div className="flex flex-row justify-between">
        <HeaderTitle>DELEGATION</HeaderTitle>
        <Button onClick={() => setIsDelegateModalOpened(true)}>Delegate</Button>
      </div>
      {isDelegateModalOpened && (
        <DelegateModal
          onClose={() => setIsDelegateModalOpened(false)}
          onDelegateTxStarted={onDelegateTxStarted}
        />
      )}
    </div>
  )
}
