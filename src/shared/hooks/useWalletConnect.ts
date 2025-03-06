import { isUserRejectedTxError, useErrorThrowerContext } from '@/components/ErrorPage'
import { useConnect } from 'wagmi'

interface Props {
  onSuccess?: () => void
}

export const useWalletConnect = ({ onSuccess }: Props = {}) => {
  const { connectors, connectAsync } = useConnect({
    mutation: { onSuccess },
  })
  const { triggerError } = useErrorThrowerContext()

  const onConnect = () => {
    if (connectors.length) {
      connectAsync({ connector: connectors[connectors.length - 1] }).catch(err => {
        if (!isUserRejectedTxError(err)) {
          triggerError(err.toString())
        }
      })
    }
  }

  return { onConnect }
}
