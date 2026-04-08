export const TX_MESSAGES = {
  proposal: {
    error: {
      title: 'Error publishing',
      content:
        'Error publishing. An unexpected error occurred while trying to publish your proposal. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Transaction sent',
      content:
        'Proposal transaction sent. Your proposal is in process. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Proposal successfully created',
      content:
        'Your proposal has been published successfully! It is now visible to the community for voting. Thank you for your contribution to the Collective.',
      severity: 'success',
      loading: false,
    },
  },
  staking: {
    error: {
      title: 'Error on staking',
      content:
        'An unexpected error occurred while trying to stake. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Staking in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Stake successful',
      content: 'Stake successful. Your stake has been successfully completed!',
      severity: 'success',
      loading: false,
    },
  },
  unstaking: {
    error: {
      title: 'Error on unstaking',
      content:
        'An unexpected error occurred while trying to unstake. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Unstaking in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Unstake successful',
      content:
        'Unstake successful. Your unstake has been successfully completed! You received your RIF back in your wallet.',
      severity: 'success',
      loading: false,
    },
  },
  queuing: {
    error: {
      title: 'Error on queuing',
      content:
        'An unexpected error occurred while trying to queue. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Queuing in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Queuing successful',
      content: 'Queuing successful. The proposal has been queued successfully!',
      severity: 'success',
      loading: false,
    },
  },
  voting: {
    error: {
      title: 'Error on voting',
      content:
        'An unexpected error occurred while trying to vote. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Voting in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Voting successful',
      content: 'Voting successful. Your vote has been successfully cast!',
      severity: 'success',
      loading: false,
    },
  },
  execution: {
    error: {
      title: 'Error on execution',
      content:
        'An unexpected error occurred while trying to execute the actions of the proposal. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
    insufficientFunds: {
      title: 'Error on execution',
      content: 'There are not enough funds in the bucket to execute this proposal. Please try again later.',
      severity: 'error',
      loading: false,
    },
    pending: {
      title: 'Execution in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Execution successful',
      content: 'Execution successful. The proposal has been executed successfully!',
      severity: 'success',
      loading: false,
    },
  },
  delegation: {
    pending: {
      title: 'Delegation in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Delegation successful',
      content: 'Voting power successfully delegated!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on delegation',
      content:
        'An unexpected error occurred while trying to execute the delegation. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  reclaiming: {
    pending: {
      title: 'Reclaiming in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Reclaiming successful',
      content: 'Voting power successfully reclaimed!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on reclaiming',
      content:
        'An unexpected error occurred while trying to execute the reclaiming. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  allowance: {
    pending: {
      title: 'Allowance in process',
      content: 'Wait for Allowance transaction to be completed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Allowance successful',
      content: 'Allowance successfully granted!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on allowance',
      content:
        'An unexpected error occurred while trying to execute the allowance. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  vaultAllowance: {
    pending: {
      title: 'Allowance in process',
      content: 'Wait for Allowance transaction to be completed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Allowance successful',
      content: 'Allowance successfully granted!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on allowance',
      content:
        'An unexpected error occurred while trying to execute the allowance. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  vaultDeposit: {
    pending: {
      title: 'Deposit in process',
      content: 'Wait for Deposit transaction to be completed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Deposit successful',
      content: 'Deposit successfully granted!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on deposit',
      content:
        'An unexpected error occurred while trying to execute the deposit. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  vaultWithdraw: {
    pending: {
      title: 'Withdraw in process',
      content: 'Wait for Withdraw transaction to be completed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Withdraw successful',
      content: 'Withdraw successfully granted!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on withdraw',
      content:
        'An unexpected error occurred while trying to execute the withdraw. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultClaim: {
    pending: {
      title: 'Claim in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Claim successful',
      content: 'Your claim has been processed successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Claim failed',
      content:
        'An unexpected error occurred while claiming. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultCancel: {
    pending: {
      title: 'Cancellation in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Request canceled',
      content: 'Your request has been canceled successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Cancellation failed',
      content:
        'An unexpected error occurred while canceling your request. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultDepositRequest: {
    pending: {
      title: 'Deposit request in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Deposit request submitted',
      content: 'Your deposit request is pending Fund Manager approval.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Deposit request failed',
      content:
        'An unexpected error occurred while submitting your deposit request. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultWithdrawRequest: {
    pending: {
      title: 'Withdrawal request in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Withdrawal request submitted',
      content: 'Your withdrawal request has been submitted successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Withdrawal request failed',
      content:
        'An unexpected error occurred while submitting your withdrawal request. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultDeWhitelist: {
    pending: {
      title: 'De-whitelist in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Address de-whitelisted',
      content: 'The whitelist role was revoked successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'De-whitelist failed',
      content: 'An unexpected error occurred while revoking the whitelist role. Please try again later.',
      severity: 'error',
      loading: false,
    },
  },
  btcVaultWhitelistGrant: {
    pending: {
      title: 'Whitelist in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Address whitelisted',
      content: 'The whitelist role was granted successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Whitelist failed',
      content:
        'An unexpected error occurred while granting the whitelist role. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  swap: {
    pending: {
      title: 'Swap in process',
      content: 'Your swap transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Swap successful',
      content: 'Swap successful. Your tokens have been swapped successfully!',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Error on swap',
      content:
        'An unexpected error occurred while trying to execute the swap. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  bufferTopUp: {
    pending: {
      title: 'Buffer top-up in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Buffer top-up successful',
      content: 'The buffer has been topped up successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Buffer top-up failed',
      content:
        'An unexpected error occurred while trying to top up the buffer. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  pauseDeposits: {
    pending: {
      title: 'Deposit pause update in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Deposit pause updated',
      content: 'Vault deposit pause setting has been updated successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Deposit pause update failed',
      content:
        'An unexpected error occurred while updating deposit pause. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  pauseWithdrawals: {
    pending: {
      title: 'Withdrawal pause update in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Withdrawal pause updated',
      content: 'Vault withdrawal pause setting has been updated successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Withdrawal pause update failed',
      content:
        'An unexpected error occurred while updating withdrawal pause. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  resumeDeposits: {
    pending: {
      title: 'Deposit resume in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Deposits resumed',
      content: 'Vault deposit setting has been updated successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Resume deposits failed',
      content:
        'An unexpected error occurred while resuming deposits. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  resumeWithdrawals: {
    pending: {
      title: 'Withdrawal resume in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Withdrawals resumed',
      content: 'Vault withdrawal setting has been updated successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Resume withdrawals failed',
      content:
        'An unexpected error occurred while resuming withdrawals. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  updateNav: {
    pending: {
      title: 'NAV update in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'NAV update successful',
      content: 'The vault NAV has been updated and funding processing has run.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'NAV update failed',
      content:
        'An unexpected error occurred while updating NAV. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  syntheticYieldTopUp: {
    pending: {
      title: 'Synthetic Yield top-up in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Synthetic Yield top-up successful',
      content: 'Synthetic Yield has been funded successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Synthetic Yield top-up failed',
      content:
        'An unexpected error occurred while funding Synthetic Yield. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
  transfer: {
    pending: {
      title: 'Transfer in process',
      content: 'Waiting for transaction confirmation...',
      severity: 'info',
      loading: true,
    },
    success: {
      title: 'Transfer successful',
      content: 'Capital has been transferred to the manager wallet successfully.',
      severity: 'success',
      loading: false,
    },
    error: {
      title: 'Transfer failed',
      content:
        'An unexpected error occurred while transferring capital. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
      loading: false,
    },
  },
} as const
