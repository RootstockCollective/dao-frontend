'use client'

import { useCallback, useEffect, useMemo } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import type { Address, Hash } from 'viem'
import { isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

import type { Proposal } from '@/app/proposals/shared/types'
import { currentEnvChain } from '@/config'
import type { ProposalCategory } from '@/shared/types'

export const PENDING_PROPOSALS_STORAGE_KEY = 'pending-proposals-v1'
export const PENDING_PROPOSAL_TTL_MS = 60 * 60 * 1000
export const PENDING_PROPOSAL_CLOCK_SKEW_MS = 5 * 60 * 1000

export type PendingProposalStage = 'confirming' | 'syncing'

export interface PendingProposal {
  transactionHash: Hash
  name: string
  proposer: Address
  category: ProposalCategory
  stage: PendingProposalStage
  submittedAt: number
  expiresAt: number
  chainId: number
  proposalId?: string
}

type PendingProposalInput = Omit<PendingProposal, 'submittedAt' | 'expiresAt' | 'chainId'>
type SyncedProposal = Pick<Proposal, 'proposalId' | 'name' | 'proposer' | 'Starts'>

function normalizeProposalName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function matchesSyncedProposal(pendingProposal: PendingProposal, proposal: SyncedProposal) {
  if (pendingProposal.proposalId) {
    return pendingProposal.proposalId === proposal.proposalId
  }

  const proposalTimestamp = proposal.Starts.valueOf()
  const hasMatchingIdentity =
    normalizeProposalName(pendingProposal.name) === normalizeProposalName(proposal.name) &&
    isAddressEqual(pendingProposal.proposer, proposal.proposer)
  const isWithinSubmissionWindow =
    proposalTimestamp >= pendingProposal.submittedAt - PENDING_PROPOSAL_CLOCK_SKEW_MS &&
    proposalTimestamp <= pendingProposal.expiresAt

  return hasMatchingIdentity && isWithinSubmissionWindow
}

/**
 * Removes placeholders that have either reached the proposal feed or outlived the sync window.
 */
export function reconcilePendingProposals(
  pendingProposals: PendingProposal[],
  proposals: SyncedProposal[],
  now = Date.now(),
) {
  return pendingProposals.filter(
    proposal =>
      proposal.expiresAt > now &&
      !proposals.some(syncedProposal => matchesSyncedProposal(proposal, syncedProposal)),
  )
}

function pendingProposalListsMatch(left: PendingProposal[], right: PendingProposal[]) {
  return (
    left.length === right.length &&
    left.every((proposal, index) => proposal.transactionHash === right[index]?.transactionHash)
  )
}

export function usePendingProposalStorage() {
  const [storedPendingProposals, setStoredPendingProposals] = useLocalStorageState<PendingProposal[]>(
    PENDING_PROPOSALS_STORAGE_KEY,
    { defaultValue: [] },
  )

  const addPendingProposal = useCallback(
    (proposal: PendingProposalInput) => {
      setStoredPendingProposals(current => {
        const existingProposal = current.find(item => item.transactionHash === proposal.transactionHash)
        const submittedAt = existingProposal?.submittedAt ?? Date.now()
        const pendingProposal: PendingProposal = {
          ...existingProposal,
          ...proposal,
          submittedAt,
          expiresAt: submittedAt + PENDING_PROPOSAL_TTL_MS,
          chainId: currentEnvChain.id,
        }

        return [pendingProposal, ...current.filter(item => item.transactionHash !== proposal.transactionHash)]
      })
    },
    [setStoredPendingProposals],
  )

  const removePendingProposal = useCallback(
    (transactionHash: Hash) => {
      setStoredPendingProposals(current =>
        current.filter(proposal => proposal.transactionHash !== transactionHash),
      )
    },
    [setStoredPendingProposals],
  )

  return {
    storedPendingProposals,
    setStoredPendingProposals,
    addPendingProposal,
    removePendingProposal,
  }
}

/**
 * Returns pending proposals for the connected wallet and reconciles them with the latest feed.
 */
export function usePendingProposals(proposals: Proposal[]) {
  const { address } = useAccount()
  const { storedPendingProposals, setStoredPendingProposals } = usePendingProposalStorage()
  const reconciledPendingProposals = useMemo(
    () => reconcilePendingProposals(storedPendingProposals, proposals),
    [proposals, storedPendingProposals],
  )

  useEffect(() => {
    setStoredPendingProposals(current => {
      const reconciled = reconcilePendingProposals(current, proposals)
      return pendingProposalListsMatch(current, reconciled) ? current : reconciled
    })
  }, [proposals, setStoredPendingProposals])

  return useMemo(() => {
    if (!address) return []

    return reconciledPendingProposals.filter(
      proposal => proposal.chainId === currentEnvChain.id && isAddressEqual(proposal.proposer, address),
    )
  }, [address, reconciledPendingProposals])
}
