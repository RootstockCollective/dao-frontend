import { AlertProps } from '@/components/Alert'
import { formatEther } from 'viem'

export const GENERIC_ERROR_TITLE = 'Error adding NFT to Wallet'

export const nftAlertMessages = {
  ADDED_SUCCESSFULLY: (tokenId: number): AlertProps => ({
    title: 'NFT added successfully',
    severity: 'success',
    content: `NFT#${tokenId} was added to wallet`,
  }),
  ERROR_ON_OWNERSHIP: (): AlertProps => ({
    title: GENERIC_ERROR_TITLE,
    severity: 'error',
    content: 'Unable to verify NFT ownership',
  }),
  ERROR_ON_TX_REJECTED: (tokenId: number): AlertProps => ({
    title: GENERIC_ERROR_TITLE,
    content: `Error adding NFT#${tokenId} to wallet: transaction rejected`,
    severity: 'error',
  }),
  ERROR_GENERIC: (tokenId: number, errorToSend: string): AlertProps => ({
    title: GENERIC_ERROR_TITLE,
    content: `Error adding NFT#${tokenId} to wallet: ${errorToSend}`,
    severity: 'error',
  }),
  NFT_ALERT_GENERIC: (alertMessage: string): AlertProps => ({
    title: 'NFT Alert',
    content: alertMessage,
    severity: 'warning',
  }),
  NFT_BALANCE_ALERT: (title: string, stRifThreshold: bigint, onStake: () => void): AlertProps => ({
    title: 'NFT Alert',
    content: (
      <>
        To get the {title} community NFT you need to own at least ${formatEther(stRifThreshold!)} stRIFs.{' '}
        <span className="underline cursor-pointer" onClick={onStake} data-testid="stakeRifLink">
          Stake RIF tokens now.
        </span>
      </>
    ),
    severity: 'warning',
  }),
  REQUESTED_TX_SENT: (): AlertProps => ({
    title: 'NFT Alert',
    content:
      'Request transaction sent. Your claim is in process. It will be visible when the transaction is confirmed.',
    severity: 'info',
  }),
  ERROR_CLAIMING_REWARD: (): AlertProps => ({
    title: 'NFT Alert',
    content:
      'Error claiming reward. An unexpected error occurred while trying to claim your reward. Please try again later. If the issue persists, contact support for assistance.',
    severity: 'error',
  }),
}
