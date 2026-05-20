<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Rootstock Collective DAO frontend. The integration covers client-side initialization via `instrumentation-client.ts` (Next.js 15.3+ approach), a server-side PostHog client for API route tracking, a reverse proxy via Next.js rewrites, user identification using wallet addresses as distinct IDs, and 16 tracked events spanning all core user flows: authentication, vault operations, governance, staking, backing, and rewards.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully authenticated via SIWE and received a JWT | `src/app/api/auth/login/route.ts` |
| `wallet_disconnected` | User disconnected their wallet and signed out | `src/shared/walletConnection/connection/DisconnectWorkflowContainer.tsx` |
| `stake_rif_confirmed` | User confirmed staking RIF tokens to receive stRIF | `src/app/user/Stake/Steps/StepThree.tsx` |
| `unstake_rif_confirmed` | User confirmed unstaking stRIF tokens | `src/app/user/Unstake/UnstakeModal.tsx` |
| `vault_allowance_approved` | User approved USDRIF allowance before depositing | `src/app/vault/components/DepositModal.tsx` |
| `vault_deposit_confirmed` | User confirmed a USDRIF deposit into the vault | `src/app/vault/components/DepositModal.tsx` |
| `vault_withdraw_confirmed` | User confirmed a USDRIF withdrawal from the vault | `src/app/vault/components/WithdrawModal.tsx` |
| `vault_swap_opened` | User opened the swap modal from the vault page | `src/app/vault/components/VaultActions.tsx` |
| `proposal_page_viewed` | User viewed the proposals list page (top of governance funnel) | `src/app/proposals/page.tsx` |
| `proposal_submitted` | User submitted a governance proposal | `src/app/proposals/new/review/page.tsx` |
| `proposal_vote_cast` | User cast a vote (for/against/abstain) on a proposal | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_queued` | User queued a succeeded proposal for execution | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_executed` | User executed a queued governance proposal | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `rewards_claimed` | User claimed collective rewards (backer or builder) | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModalView.tsx` |
| `backing_distributed_equally` | User clicked distribute equally across builders | `src/app/backing/BackingPage.tsx` |
| `backing_allocations_saved` | User saved updated stRIF backing allocations on-chain | `src/app/shared/components/BuilderCard/BuilderCardControl.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/431518/dashboard/1604423)
- [User sign-ins over time](https://us.posthog.com/project/431518/insights/urqkPauY) — daily unique users signing in
- [Governance actions over time](https://us.posthog.com/project/431518/insights/wedzHhgO) — proposals submitted, votes cast, and executions
- [Staking activity](https://us.posthog.com/project/431518/insights/4oY9W1aI) — RIF stake vs. unstake volume comparison
- [Vault deposit conversion funnel](https://us.posthog.com/project/431518/insights/KnVVUjwB) — allowance approval → deposit confirmation conversion rate
- [Rewards & backing activity](https://us.posthog.com/project/431518/insights/JhZ6CHgH) — rewards claimed and backing allocation saves

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
