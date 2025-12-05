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
} as const
