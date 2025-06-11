import { Button } from '@/components/ButtonNew/Button'
import { Divider } from '@/components/Divider'
import { Hash } from 'viem'
import { ProgressButtonInProgress } from '@/app/user/Stake/components/ProgressButtonInProgress'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'

interface Props {
  isTxPending: boolean
  isRequesting: boolean
  isTxFailed: boolean
  unstakeTxHash?: Hash
  cannotProceed: boolean
  onUnstake: () => void
}

export const UnstakeActions = ({
  isTxPending,
  isRequesting,
  isTxFailed,
  unstakeTxHash,
  cannotProceed,
  onUnstake,
}: Props) => (
  <>
    <TransactionStatus
      txHash={unstakeTxHash}
      isTxFailed={isTxFailed}
      failureMessage="Unstake TX failed."
      className="mt-8"
    />

    <Divider className="mt-8" />

    <div className="flex justify-end">
      {isTxPending ? (
        <ProgressButtonInProgress />
      ) : (
        <Button
          variant="primary"
          className="w-full md:w-auto"
          onClick={onUnstake}
          disabled={cannotProceed}
          data-testid="UnstakeButton"
        >
          {isRequesting ? 'Requesting...' : 'Unstake'}
        </Button>
      )}
    </div>
  </>
)
