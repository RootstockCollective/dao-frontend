import { useAlertContext } from '@/app/providers'
import { useDelegateToAddress } from '@/app/user/Delegation/hooks/useDelegateToAddress'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useAccount } from 'wagmi'
import { DelegationAction } from './type'

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
        setGlobalMessage(TX_MESSAGES.reclaiming.pending)
        onDelegateTxStarted(txHash, 'reclaiming')
      })
      .catch(err => {
        if (!isUserRejectedTxError(err)) {
          setGlobalMessage(TX_MESSAGES.reclaiming.error)
        }
      })
  }

  return (
    <p
      onClick={onReclaim}
      className={isPending ? 'text-zinc-500' : 'text-primary cursor-pointer'}
      data-testid="Reclaim"
    >
      Reclaim
    </p>
  )
}
