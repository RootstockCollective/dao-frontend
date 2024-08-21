export const TX_MESSAGES = {
  proposal: {
    error: {
      title: 'Error publishing',
      content:
        'Error publishing. An unexpected error occurred while trying to publish your proposal. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
    },
    pending: {
      title: 'Transaction sent',
      content:
        'Proposal transaction sent. Your proposal is in process. It will be visible when the transaction is confirmed.',
      severity: 'info',
    },
    success: {
      title: 'Proposal successfully created',
      content:
        'Proposal successfully created. Your proposal has been published successfully! It is now visible to the community for review and feedback. Thank you for your contribution.',
      severity: 'success',
    },
  },
  staking: {
    error: {
      title: 'Error on staking',
      content:
        'An unexpected error occurred while trying to stake. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
    },
    pending: {
      title: 'Staking in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
    },
    success: {
      title: 'Stake successful',
      content:
        'Stake successful. Your stake has been successfully completed! You will start receiving rewards in your stRIF balance.',
      severity: 'success',
    },
  },
  unstaking: {
    error: {
      title: 'Error on unstaking',
      content:
        'An unexpected error occurred while trying to unstake. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
    },
    pending: {
      title: 'Unstaking in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
    },
    success: {
      title: 'Unstake successful',
      content:
        'Unstake successful. Your unstake has been successfully completed! You received your RIF back in your wallet.',
      severity: 'success',
    },
  },
  queuing: {
    error: {
      title: 'Error on queuing',
      content:
        'An unexpected error occurred while trying to queue. Please try again later. If the issue persists, contact support for assistance.',
      severity: 'error',
    },
    pending: {
      title: 'Queuing in process',
      content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
      severity: 'info',
    },
    success: {
      title: 'Queuing successful',
      content: 'Queuing successful. The proposal has been queued successfully!',
      severity: 'success',
    },
  },
} as const
