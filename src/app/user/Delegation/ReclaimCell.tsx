import { useAlertContext } from '@/app/providers'
import { useDelegateToAddress } from '@/app/user/Delegation/hooks/useDelegateToAddress'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useAccount } from 'wagmi'
import { DelegationAction } from './type'
import { Button } from '@/components/Button'

type Props = {
  onDelegateTxStarted: (hash: string, action?: DelegationAction) => void
}

export const ReclaimCell = ({ onDelegateTxStarted }: Props) => {
  const { address } = useAccount()
  const { onDelegate, isPending } = useDelegateToAddress()
  const { setMessage: setGlobalMessage } = useAlertContext()

  const onReclaim = async () => {
    if (!address || isPending) return
    onDelegate(address)
      .then(txHash => {
        setGlobalMessage(TX_MESSAGES.reclaim.pending)
        onDelegateTxStarted(txHash, 'reclaiming')
      })
      .catch(err => {
        if (!isUserRejectedTxError(err)) {
          setGlobalMessage(TX_MESSAGES.reclaim.error)
        }
      })
  }

  return (
    <Button variant="outlined" onClick={onReclaim} disabled={isPending} data-testid="Reclaim">
      Reclaim
    </Button>
  )
}
