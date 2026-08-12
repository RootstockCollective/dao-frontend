'use client'

import { getTransactionReceipt, waitForTransactionReceipt } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { Hash, parseEventLogs } from 'viem'
import { useAccount } from 'wagmi'

import { type PendingProposal, usePendingProposalStorage } from '@/app/proposals/hooks/usePendingProposals'
import { config, currentEnvChain } from '@/config'
import { GovernorAbi } from '@/lib/abis/Governor'
import { showToast, updateToast } from '@/shared/notification'
import { TX_MESSAGES } from '@/shared/txMessages'
import { ProposalCategory } from '@/shared/types'

import { ProposalRecord } from '../proposals/shared/types'

interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
  waitForTxInBg: (
    proposalTxHash: Hash,
    proposalName: string,
    category: ProposalCategory,
    onComplete?: () => void,
  ) => Promise<void>
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

class DefinitiveProposalConfirmationError extends Error {}

type ProposalConfirmationDetails = Pick<PendingProposal, 'transactionHash' | 'name' | 'category'>

/**
 * Tells whether the stored draft is the one that produced the proposal that just confirmed.
 *
 * Within the session we hold the exact draft that was submitted, so identity is the strongest
 * signal and keeps a newer draft the author started meanwhile. After a reload that reference is
 * gone and the placeholder's proposal name is all we have left to recognise the draft by.
 */
function isSubmittedDraft(
  current: ProposalRecord | null,
  proposalName: string,
  submittedRecord?: ProposalRecord | null,
) {
  if (!current) return false
  if (submittedRecord) return current === submittedRecord

  return current.form.proposalName === proposalName
}

/**
 * Provides proposal review state management for multi-step proposal creation.
 *
 * Persists form data in localStorage, handles navigation between steps,
 * and monitors transaction status with background notifications.
 */
export function ReviewProposalProvider({ children }: PropsWithChildren) {
  const router = useRouter()
  const { address } = useAccount()
  const [record, setRecord] = useLocalStorageState<ProposalRecord | null>('review-proposal', {
    defaultValue: null,
  })
  const { storedPendingProposals, addPendingProposal, removePendingProposal } = usePendingProposalStorage()
  const activeConfirmationHashes = useRef(new Set<Hash>())

  const confirmPendingProposal = useCallback(
    async (
      proposal: ProposalConfirmationDetails,
      showNotifications: boolean,
      submittedRecord?: ProposalRecord | null,
    ) => {
      const { transactionHash, name, category } = proposal
      if (activeConfirmationHashes.current.has(transactionHash)) return

      activeConfirmationHashes.current.add(transactionHash)
      let replacementIsDefinitive = false
      let replacementReceiptStatus: 'success' | 'reverted' | undefined

      try {
        const receipt = await waitForTransactionReceipt(config, {
          hash: transactionHash,
          onReplaced: ({ reason, transactionReceipt }) => {
            replacementIsDefinitive = reason === 'cancelled' || reason === 'replaced'
            replacementReceiptStatus = transactionReceipt.status
          },
        })

        if (replacementIsDefinitive) {
          throw new DefinitiveProposalConfirmationError(
            'Proposal transaction was cancelled or replaced by a different transaction',
          )
        }

        const [proposalCreatedEvent] = parseEventLogs({
          abi: GovernorAbi,
          logs: receipt.logs,
          eventName: 'ProposalCreated',
        })

        if (!proposalCreatedEvent) {
          throw new DefinitiveProposalConfirmationError(
            'ProposalCreated event missing from confirmed proposal tx',
          )
        }

        addPendingProposal({
          transactionHash,
          proposalId: proposalCreatedEvent.args.proposalId.toString(),
          name,
          proposer: proposalCreatedEvent.args.proposer,
          category,
          stage: 'syncing',
        })

        setRecord(current => (isSubmittedDraft(current, name, submittedRecord) ? null : current))

        if (showNotifications) {
          updateToast(transactionHash, {
            ...TX_MESSAGES.proposal.success,
            dataTestId: `success-tx-${transactionHash}`,
            txHash: transactionHash,
            toastId: transactionHash,
          })
        }
      } catch (err) {
        let isDefinitiveFailure =
          err instanceof DefinitiveProposalConfirmationError || replacementReceiptStatus === 'reverted'

        if (!isDefinitiveFailure) {
          try {
            const receipt = await getTransactionReceipt(config, { hash: transactionHash })
            isDefinitiveFailure = receipt.status === 'reverted'
          } catch {
            // The receipt is still unavailable, so the outcome is unknown and the placeholder must stay.
          }
        }

        if (isDefinitiveFailure) {
          removePendingProposal(transactionHash)
          console.error('Error confirming proposal tx', err)

          if (showNotifications) {
            updateToast(transactionHash, {
              ...TX_MESSAGES.proposal.error,
              dataTestId: `error-tx-${transactionHash}`,
              txHash: transactionHash,
              toastId: transactionHash,
            })
          }
        } else {
          console.warn('Proposal confirmation is still pending', err)

          if (showNotifications) {
            updateToast(transactionHash, {
              ...TX_MESSAGES.proposal.delayed,
              dataTestId: `info-tx-${transactionHash}`,
              txHash: transactionHash,
              toastId: transactionHash,
            })
          }
        }
      } finally {
        activeConfirmationHashes.current.delete(transactionHash)
      }
    },
    [addPendingProposal, removePendingProposal, setRecord],
  )

  useEffect(() => {
    storedPendingProposals
      .filter(
        proposal =>
          proposal.chainId === currentEnvChain.id &&
          proposal.stage === 'confirming' &&
          proposal.expiresAt > Date.now(),
      )
      .forEach(proposal => void confirmPendingProposal(proposal, false))
  }, [confirmPendingProposal, storedPendingProposals])

  /**
   * Monitors proposal transaction in background and shows toast notifications.
   * Shows pending toast immediately, waits for confirmation, then shows success toast.
   */
  const waitForTxInBg = useCallback(
    async (
      proposalTxHash: Hash,
      proposalName: string,
      proposalCategory: ProposalCategory,
      onComplete?: () => void,
    ) => {
      const { pending } = TX_MESSAGES.proposal
      const submittedRecord = record

      try {
        // Show pending toast
        showToast({
          ...pending,
          dataTestId: `info-tx-${proposalTxHash}`,
          txHash: proposalTxHash,
          toastId: proposalTxHash,
        })

        if (address) {
          addPendingProposal({
            transactionHash: proposalTxHash,
            name: proposalName,
            proposer: address,
            category: proposalCategory,
            stage: 'confirming',
          })
        }
        router.push('/proposals')

        await confirmPendingProposal(
          {
            transactionHash: proposalTxHash,
            name: proposalName,
            category: proposalCategory,
          },
          true,
          submittedRecord,
        )
      } finally {
        onComplete?.()
      }
    },
    [addPendingProposal, address, confirmPendingProposal, record, router],
  )

  const value = useMemo<ReviewProposalState>(
    () => ({
      record,
      setRecord,
      waitForTxInBg,
    }),
    // eslint-disable-next-line
    [record, waitForTxInBg],
  )
  return <ReviewProposalContext.Provider value={value}>{children}</ReviewProposalContext.Provider>
}

export function useReviewProposal() {
  const context = useContext(ReviewProposalContext)
  if (!context) {
    throw new Error('The hook useReviewProposal should be used with ReviewProposalProvider')
  }
  return context
}
