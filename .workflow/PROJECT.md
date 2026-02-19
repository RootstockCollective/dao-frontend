# DAO Frontend Project Reference

> Source: `../dao-frontend` (https://github.com/RootstockCollective/dao-frontend)
> Version: 1.17.1

## Business Context

RootstockCollective is a decentralized autonomous organization (DAO) that governs the Rootstock ecosystem — an EVM-compatible Bitcoin sidechain. The platform exists to solve two problems:

1. **Governance** — RIF token holders need a transparent, on-chain mechanism to propose, debate, and vote on how ecosystem funds are allocated (grants, treasury management, protocol changes).
2. **Builder Incentives** — The ecosystem needs a way to attract and retain developers. Collective Rewards lets community members ("backers") stake tokens behind builders they believe in, creating a cycle where builders earn rewards proportional to community support, and backers earn a share of those rewards for participating.

The frontend is the primary interface through which all participants interact with the on-chain governance contracts and the Collective Rewards system. Without it, users would need to call smart contracts directly.

## Domain Glossary

### Tokens

| Term | Definition |
|------|-----------|
| **RIF** | The native utility and governance token of the Rootstock ecosystem. Users stake RIF to participate in governance and earn rewards. |
| **stRIF** | Staked RIF. Minted 1:1 when a user stakes RIF. Represents voting power in the DAO and is the unit used for backing builders. stRIF is non-transferable — it can only be obtained by staking and returned by unstaking. |
| **USDRIF** | A USD-pegged stablecoin on Rootstock. Used as a reward token distributed to builders and backers, and as the deposit asset for the yield-generating vault. |
| **USDT0** | A bridged USDT stablecoin on Rootstock. Swappable with USDRIF through the integrated DEX. |
| **rBTC** | Native currency of the Rootstock chain (pegged to Bitcoin). Used for gas fees and held in the DAO treasury. |

### Participants

| Term | Definition |
|------|-----------|
| **Backer** | A community member who allocates their stRIF to support builders. Backers earn a share of rewards proportional to their allocation. They incentivize the ecosystem by signaling which builders deserve funding. |
| **Builder** | A developer, project, or team registered in the Builder Registry. Builders receive rewards from the Collective Rewards system based on how much backing (stRIF allocation) they attract. |
| **Delegatee** | An address that has received delegated voting power from other stRIF holders. Delegatees vote on proposals on behalf of their delegators, without holding the underlying tokens. |
| **Voter** | Any address with voting power (own stRIF + received delegations - outgoing delegations) that participates in proposal voting. |

### Governance

| Term | Definition |
|------|-----------|
| **Proposal** | An on-chain governance action submitted for community vote. Proposals move through states: Pending → Active → Succeeded/Defeated → Queued → Executed. Types include Grants (treasury transfers), Builder Activation, Builder Deactivation, and Milestone progress. |
| **Governor** | The core governance smart contract (OpenZeppelin GovernorBravo pattern). Manages proposal lifecycle, vote tallying, quorum enforcement, and execution. |
| **Voting Power** | A user's weight in governance votes. Calculated as: own stRIF balance + delegated-in stRIF - delegated-out stRIF, optionally boosted by NFT multipliers. |
| **Delegation** | The act of assigning one's voting power to another address without transferring tokens. A user can reclaim delegated power at any time by delegating back to themselves. |
| **Timelock** | A mandatory delay between proposal approval and execution (TimelockController contract). Gives the community time to react before funds move or protocol changes take effect. |
| **Treasury** | The DAO's on-chain fund reserves holding rBTC, RIF, and USDRIF. Organized into buckets: Grants, Growth, and General. Funds can only be released through successful governance proposals. |
| **Quorum** | The minimum number of votes required for a proposal to be valid, regardless of the outcome. |

### Collective Rewards

| Term | Definition |
|------|-----------|
| **Collective Rewards (CR)** | The incentive system that distributes RIF, rBTC, and USDRIF to builders and their backers on a recurring cycle. Designed to attract and retain ecosystem contributors. |
| **Reward Cycle** | A fixed time period during which rewards accumulate. At the end of each cycle, rewards are calculated based on builder backing allocations and can be claimed by participants. |
| **Allocation** | A backer's distribution of their stRIF across one or more builders. The total allocation cannot exceed the backer's stRIF balance. Allocations determine the share of rewards each builder (and their backers) receives. |
| **Gauge** | A per-builder smart contract that tracks reward distribution. Each registered builder gets a gauge. Gauges can be active or halted (if a builder is deactivated). |
| **Builder Registry** | The smart contract that manages the list of approved builders, their gauges, and their activation status. |

### NFT Communities

| Term | Definition |
|------|-----------|
| **Early Adopters** | NFT for the first 101 stakers with 1+ stRIF. Self-claimed. Provides a voting power booster. |
| **OG Founders** | NFT for accounts holding 1+ stRIF on September 23, 2024. Self-claimed. Voting power booster. |
| **OG Partners** | NFT for external ecosystem collaborators with 25k+ stRIF. Air-dropped. Voting power booster. |
| **OG Contributors** | NFT for recognized early community contributors. Air-dropped. Provides delegation kickstarter or voting booster. |
| **Vanguard** | NFT for governance pioneers who voted on 1+ of the last 3 proposals. Self-claimed. Voting power booster. |
| **Beta Builders** | NFT for the first 50 Collective Rewards builders. Air-dropped. Voting power booster. |
| **Rootlings Series 1** | Community badges for Rootling Challenge participation. Holders are active backers combining governance with community involvement. |

### Financial Mechanisms

| Term | Definition |
|------|-----------|
| **USDRIF Vault** | A yield-generating vault where users deposit USDRIF to earn APY returns. Deposits mint vault shares; withdrawals burn shares. Requires KYC verification and terms acceptance. |
| **Permit2** | An EIP-712 signature-based token approval mechanism. Instead of two transactions (approve + swap), users sign a message off-chain and execute in one transaction. Includes expiration deadlines and nonce-based replay protection. |
| **Treasury Buckets** | The treasury is divided into purpose-specific buckets: **Grants** (project funding), **Growth** (ecosystem development), and **General** (flexible allocation). Each bucket has its own on-chain address. |

## User Personas

### Backer
A community member who stakes RIF and allocates their stRIF across builders they want to support. Backers earn a share of the Collective Rewards proportional to their allocations. They are the demand signal of the ecosystem — their choices determine which builders get funded. A backer may also vote on proposals and delegate voting power.

### Builder
A developer or project team registered in the Builder Registry. Builders are nominated through a governance proposal and, once activated, receive rewards based on community backing. Their primary concern is attracting backers and delivering value to retain support across reward cycles.

### Governance Voter
A stRIF holder (or delegatee) who actively participates in proposal voting. They review proposals on the governance forum (Discourse), evaluate treasury allocation requests, and cast on-chain votes. Some voters hold NFTs that boost their voting power.

### Delegator
A stRIF holder who prefers not to vote directly. They delegate their voting power to a trusted delegatee — often a community leader or organization — who votes on their behalf. The delegator retains their tokens and can reclaim voting power at any time.

### Passive Staker
A RIF holder who stakes primarily for yield (staking rewards, vault APY) without active governance participation. They may hold NFTs for boosted returns but rarely vote or back builders directly.

## Key User Journeys

### 1. Stake RIF

**Goal:** Convert RIF tokens into stRIF to gain voting power and backing ability.

**Entry:** `/user` page → "Stake" tab

**Flow:**
1. User connects wallet (must hold RIF tokens).
2. Navigates to the user dashboard and selects the Stake action.
3. Enters the amount of RIF to stake.
4. Approves RIF spending (if first time).
5. Confirms the stake transaction — calls `StRIFToken.depositAndDelegate()`.
6. stRIF is minted 1:1 and appears in the user's balance immediately.

**Prerequisites:** Connected wallet, RIF balance > 0.

---

### 2. Unstake RIF

**Goal:** Convert stRIF back to RIF tokens.

**Entry:** `/user` page → "Unstake" tab

**Flow:**
1. User navigates to user dashboard and selects Unstake.
2. Enters the amount to unstake.
3. System validates that the remaining stRIF covers any existing builder allocations (cannot unstake below your total allocation).
4. Confirms the transaction — calls `StRIFToken.withdrawTo()`.
5. stRIF is burned, RIF is returned immediately.

**Prerequisites:** Connected wallet, stRIF balance > 0, remaining balance must cover active allocations.

---

### 3. Vote on a Proposal

**Goal:** Cast a governance vote on an active proposal.

**Entry:** `/proposals` → select proposal → `/proposals/[id]`

**Flow:**
1. User browses active proposals on the proposals page.
2. Selects a proposal to view details, description, and linked Discourse discussion.
3. Reviews the proposal actions (e.g., treasury transfer amount, target address).
4. Chooses a vote: **For**, **Against**, or **Abstain**.
5. Confirms the transaction — calls `Governor.castVote()`.
6. Vote is recorded on-chain. Voting power is locked at the proposal's snapshot block.

**Prerequisites:** Connected wallet, voting power >= 1 stRIF, proposal must be in Active state, user has not already voted on this proposal.

---

### 4. Create a Proposal

**Goal:** Submit a new governance proposal for community vote.

**Entry:** `/proposals` → "Create Proposal" button

**Flow:**
1. User clicks Create Proposal (button only visible if voting power meets the proposal threshold).
2. Selects proposal type: **Grant** (treasury transfer), **Builder Activation**, or **Builder Deactivation**.
3. Fills in details: title, description, Discourse discussion link.
4. For Grants: specifies recipient address, token (RIF/rBTC/USDRIF), amount, and treasury bucket.
5. Reviews the proposal on a confirmation page.
6. Submits the transaction — calls `Governor.propose()`.
7. Proposal enters Pending state, then becomes Active after the voting delay period.

**Prerequisites:** Connected wallet, voting power >= proposal threshold.

---

### 5. Delegate Voting Power

**Goal:** Assign voting power to a trusted community member.

**Entry:** `/delegate`

**Flow:**
1. User navigates to the delegation page.
2. Browses a list of delegatees showing their voting power, vote count, and delegator count.
3. Selects a delegatee (or enters a custom address / .rsk domain).
4. Confirms the delegation — calls `StRIFToken.delegate()`.
5. Voting power transfers immediately. The user's tokens remain in their wallet.
6. To reclaim: user delegates back to their own address.

**Prerequisites:** Connected wallet, stRIF balance > 0.

---

### 6. Back a Builder

**Goal:** Allocate stRIF to one or more builders to earn Collective Rewards.

**Entry:** `/backing`

**Flow:**
1. User navigates to the backing page (requires `v3_design` feature flag).
2. Browses the list of active builders showing their profiles and current backing levels.
3. Selects builders to back by toggling them on.
4. Distributes allocation across selected builders — either manually (drag sliders) or via "distribute equally."
5. Total allocation must not exceed the user's available stRIF balance.
6. Confirms the allocation — writes to the `BackersManager` contract.
7. Allocations take effect in the next reward cycle.

**Prerequisites:** Connected wallet, stRIF balance > 0, at least one active builder available.

---

### 7. Claim Rewards

**Goal:** Collect earned Collective Rewards (RIF, rBTC, USDRIF).

**Entry:** `/my-rewards`

**Flow:**
1. User navigates to My Rewards page.
2. Views earned rewards broken down by token type and cycle.
3. Clicks Claim — calls `BackersManager.claimBackerRewards()` (for backers) or the builder-specific claim function.
4. Rewards are transferred to the user's wallet.
5. Claimed amounts reset; new rewards begin accruing in the current cycle.

**Prerequisites:** Connected wallet, unclaimed rewards > 0, reward cycle has ended.

---

### 8. Swap Tokens (USDT0 ↔ USDRIF)

**Goal:** Exchange USDT0 for USDRIF (or vice versa) through the integrated DEX.

**Entry:** `/user` page → "Swap" tab

**Flow:**
1. User selects the swap action on the user dashboard.
2. Enters the amount to swap. A quote is fetched from Uniswap V3 and IceCreamSwap; the best rate is displayed.
3. Approves token spending via Permit2 (EIP-712 signature — no separate on-chain approval transaction).
4. Confirms the swap — calls `UniversalRouter.execute()` with the V3_SWAP_EXACT_IN command.
5. Tokens are exchanged atomically. New balances reflect immediately.

**Prerequisites:** Connected wallet, source token balance > 0. Quotes refresh every 30 seconds.

---

### 9. Deposit into USDRIF Vault

**Goal:** Deposit USDRIF into the yield vault to earn APY.

**Entry:** `/vault`

**Flow:**
1. User navigates to the vault page (requires `vault` feature flag).
2. Accepts Terms & Conditions and passes KYC verification (first time only).
3. Enters the USDRIF amount to deposit.
4. Approves USDRIF spending (if first time).
5. Confirms the deposit — calls `Vault.depositWithSlippage()` (default 0.5% slippage tolerance).
6. Vault shares are minted proportional to the deposit. Yield accrues continuously.
7. To withdraw: enters share amount, calls `Vault.withdrawWithSlippage()`, receives USDRIF.

**Prerequisites:** Connected wallet, USDRIF balance > 0, KYC verified, terms accepted.

## Smart Contracts

### Governance

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| Governor | `0x71ac6ff904a17f50f2c07b693376ccc1c92627f0` | `0xB1A39B8f57A55d1429324EEb1564122806eb297F` | Proposal lifecycle, voting, quorum, execution |
| Timelock Controller | — | — | Enforces delay between approval and execution |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` | `0xcA11bde05977b3631167028862bE2a173976CA11` | Batch RPC reads in a single call |

### Tokens

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| RIF Token | `0x2acc95758f8b5f583470ba265eb685a8f45fc9d5` | `0x19f64674d8a5b4e652319f5e239efd3bc969a1fe` | Native DAO token, staking input |
| stRIF Token | `0x5db91e24bd32059584bbdb831a901f1199f3d459` | `0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f` | Staked RIF — voting power, allocation unit |
| USDRIF | `0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37` | `0x8dbf326e12a9ff37ed6ddf75ada548c2640a6482` | USD stablecoin, reward token, vault asset |
| USDT0 | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | `0x5a2256DD0DfbC8cE121d923AC7D6E7A3fc7F9922` | Bridged USDT, swap pair with USDRIF |

### Treasury Buckets

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| Grants Bucket | `0x48229e5D82a186Aa89a99212D2D59f5674aa5b6C` | `0xfaca664c661af7e0e630c8f92b401012cd2a30ef` | Holds funds earmarked for grants |
| Grants Active Bucket | `0xf016fa6b237bb56e3aee7022c6947a6a103e3c47` | `0x2217E4d3Ae0A6E30075D1B5a7b8C1520E8009f49` | Active grant distributions |
| Growth Bucket | `0x267a6073637408b6A1d34d685ff5720A0CbCbD9d` | `0x420f39968009a0e8693a0e1bba633cd99eaffb9b` | Ecosystem growth initiatives |
| General Bucket | `0xfE3d9B7D68aE13455475F28089968336414FD358` | `0x72Ed7d7b7835Ad62B1f9b6280bAd62618aA71461` | Flexible treasury allocation |

### Collective Rewards

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| Backers Manager | `0x7995C48D987941291d8008695A4133E557a11530` | `0x70AC0FE4F8BCA42Aa7e713E1EDA2E8166d0f8Ed8` | Backer registrations, allocations, reward claims |
| Builder Registry | `0x8cb62c58AC3D1253c6467537FDDc563857eD76cb` | `0xad125E6D5C3B84329fa2466A8A6955F67906F4b2` | Builder registration, activation status, gauges |
| Reward Distributor | `0x5603Ba40257e317e45BA13C3732819Af5E81a9A1` | `0x35EB7d3e0907BCB838fbA3b08C4c65DB5431169f` | Calculates and distributes cycle rewards |
| Gauge | _(per-builder)_ | _(per-builder)_ | Tracks allocation weight per builder |
| Cycle Time Keeper | — | — | Manages reward cycle timing |

### Vault

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| USDRIF Vault | `0xd8169270417050dcef119597a7f6f5674aa5b6C3` | `0x91fF73cC130333dbE2e6FAf4F365fB66F95fa73b` | Yield vault — deposit USDRIF, earn APY |
| Vault Deposit Limiter | — | — | Enforces max deposit caps |

### DEX / Swap (Mainnet Only)

| Contract | Address | Purpose |
|----------|---------|---------|
| Uniswap QuoterV2 | `0xb51727c996C68E60F598A923a5006853cd2fEB31` | Get swap price quotes without executing |
| Uniswap Universal Router | `0x244f68e77357f86a8522323eBF80b5FC2F814d3E` | Execute token swaps |
| Permit2 | `0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5` | Signature-based approvals (Rootstock-specific deployment) |
| IceCreamSwap Router | `0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c` | Alternative DEX routing |
| USDT0-USDRIF Pool | `0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0` | Primary liquidity pool for stablecoin swaps |

### NFTs

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| Early Adopters | `0x339f209b3eb8381c4fbe997232e95a21a731524c` | `0x0Ee4e11f2F2B551cA31Ea7873c7bA675cb51A59d` | First 101 stakers badge, voting booster |
| OG Founders | `0x0025e59f281bc06e7A54afe780673bd6A8D3a7E9` | `0x7E6d9969CAC008bAe5f7b144df3c955515404538` | Day-one staker badge, voting booster |
| OG Partners | `0x8158aBDAEdD7770F372031aC0AaB8FB4BC9ABe75` | `0x285046a90fb322E6BaCa4F38Bb884e3C0904F7EB` | Ecosystem partner badge, voting booster |
| OG Contributors | `0x5b20eDd661a2B87A9C9AE55d3e3b09281Dc71C48` | `0xDC03B8fb7E47E4651f5008bD718a804726424A75` | Community contributor badge |
| Vanguard | `0x1EEA464C8632A71A2E9B364725da6e09aaed2Ddc` | `0xa7ecEb042069111C4685bD3b0DB6dE9278d90ca8` | Governance pioneer badge, voting booster |
| Beta Builders | `0x7a67640BC00Dacc3b73cCb579B9Fe98EAd5451cf` | `0x10eEf0E20F4874E35a4247Bf9FDED7b872A127f5` | First 50 CR builders badge |
| Rootlings S1 | `0x9110035Fe1FD3c34736E9EaA3E390E6cCe514ccA` | `0x481797DCc43fD3D7B9452dE1FCFC0D2fD0556Fa8` | Community challenge badge |

### Infrastructure

| Contract | Mainnet (Chain 30) | Testnet (Chain 31) | Purpose |
|----------|-------------------|-------------------|---------|
| RNS Registry | `0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5` | `0x7d284aaac6e925aad802a53c0c69efe3764597b8` | .rsk domain name resolution |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | React 19, Tailwind CSS 4, Radix UI primitives |
| Web3 | Wagmi 2, Viem 2, Reown AppKit (WalletConnect) |
| State | Zustand 5, React Query 5, Apollo Client 3 (GraphQL) |
| Forms | React Hook Form 7, Zod validation |
| Database | PostgreSQL via Knex.js |
| Auth | SIWE (Sign In with Ethereum), JWT (Jose) |
| Testing | Vitest 3 (unit), Cypress 13 (E2E), React Testing Library |
| Dev Tools | ESLint, Prettier, Husky, Storybook 9 |
| Deployment | Docker (standalone), GitHub Actions CI/CD |

## Project Structure

```
dao-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Server-side API routes
│   │   │   ├── allocations/    # Reward allocations
│   │   │   ├── auth/           # SIWE authentication
│   │   │   ├── backers/        # Backer metrics
│   │   │   ├── builders/       # Builder registry
│   │   │   ├── contributors/   # Contributor data
│   │   │   ├── cycles/         # Reward cycles
│   │   │   ├── db/             # Database operations
│   │   │   ├── discourse/      # Forum integration
│   │   │   ├── metrics/        # On-chain metrics
│   │   │   ├── proposals/      # DAO proposals
│   │   │   ├── staking/        # Staking data
│   │   │   ├── swap/           # DEX swap
│   │   │   └── vault/          # USDRIF vault
│   │   ├── backing/            # Builder backing/allocation
│   │   ├── builders/           # Builders page
│   │   ├── collective-rewards/ # CR feature module
│   │   ├── communities/        # Communities page
│   │   ├── delegate/           # Delegation features
│   │   ├── my-rewards/         # Personal rewards
│   │   ├── proposals/          # Proposals page
│   │   ├── staking-history/    # Historical staking
│   │   ├── treasury/           # Treasury/vault display
│   │   ├── user/               # User profile
│   │   ├── vault/              # Vault interface
│   │   └── providers/          # Context providers
│   ├── components/             # 70+ reusable UI components
│   ├── shared/                 # Shared utilities
│   │   ├── context/            # React contexts (feature flags, prices, balances)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   ├── types/              # TypeScript type definitions
│   │   ├── walletConnection/   # Wallet connection logic
│   │   └── notification/       # Notification system
│   ├── config/                 # Wagmi config, feature flags
│   ├── lib/                    # Utility libraries
│   │   ├── abis/               # Smart contract ABIs
│   │   ├── auth/               # JWT + SIWE utilities
│   │   ├── swap/               # DEX swap utilities
│   │   ├── constants.ts        # Global constants & addresses
│   │   └── endpoints.ts        # API endpoint definitions
│   ├── db/migrations/          # Knex.js database migrations
│   └── theme/                  # Tailwind theme (base, default, design_v3)
├── cypress/                    # E2E tests
├── docs/                       # Developer docs
├── .storybook/                 # Storybook config
├── .env.*                      # Environment configs (dev, testnet, mainnet, fork)
└── scripts/                    # Utility scripts
```

## Key Features

### DAO Governance
- Proposal viewing, creation, and voting
- Delegation management
- Governor contract interaction
- Treasury/vault management

### Collective Rewards (CR)
- Builder registry and profiles
- Backing/allocation system (drag-and-drop)
- Reward distribution and claims
- NFT-based reputation (OG Founders, OG Partners, Vanguard, Rootlings)

### Staking & DeFi
- RIF token staking with rewards
- USDRIF vault integration
- DEX swap (Uniswap V3 + IceCreamSwap aggregation)
- Multi-hop routing, permit-based transactions
- Historical transaction tracking with CSV export

### Wallet Support
- MetaMask, Ledger, Trezor, SafePal, Bitget, Rabby, and more
- SIWE authentication
- RNS (Rootstock Name Service) integration

## Architecture Patterns

- **Routing**: Next.js App Router with file-based routing
- **State**: Wagmi for wallet state, Zustand for client state, React Query for server state, Apollo for GraphQL
- **Components**: Radix UI primitives + custom library, Storybook for documentation
- **API**: Next.js API routes (serverless), PostgreSQL via Knex.js, GraphQL via The Graph
- **Auth**: SIWE + JWT with cookie-based SSR persistence
- **Contracts**: ABIs in `src/lib/abis/`, Viem for type-safe calls, Multicall3 for batch reads

## Environments

| Environment | Profile | URL | Chain |
|-------------|---------|-----|-------|
| Mainnet | `.mainnet` | https://app.rootstockcollective.xyz | 30 |
| Dev | `.dev` | https://dev.app.rootstockcollective.xyz | 31 (reduced timings) |
| Testnet Local | `.testnet.local` | http://localhost:3000 | 31 (CORS bypass) |
| CR QA | `.cr.qa` | https://qa.cr.rootstockcollective.xyz | 31 |
| DAO QA | `.dao.qa` | https://qa.dao.rootstockcollective.xyz | 31 |
| Fork | `.fork` | http://localhost:3000 | 31337 (Anvil) |
| RC Testnet | `.release-candidate-testnet` | https://release-candidate-testnet.app.rootstockcollective.xyz | 31 |
| RC Mainnet | `.release-candidate-mainnet` | https://release-candidate-mainnet.app.rootstockcollective.xyz | 30 |

Select environment via: `PROFILE=<env> npm run dev`

## NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with Turbopack |
| `npm run dev:fork` | Dev server with fork profile |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook on port 6006 |
| `npm run e2e-open` | Cypress interactive |
| `npm run e2e-test` | Cypress headless |
| `npm run db:migrate` | Run database migrations |
| `npm run fork:anvil` | Start local Anvil fork |

## Testing Strategy

- **Unit (Vitest)**: Component tests, hooks, utilities, API routes. Three test projects: default (testnet), mainnet (DEX quotes), fork (swap execution)
- **E2E (Cypress)**: User workflow testing against localhost:3000
- **Storybook**: Visual component testing and documentation

## Third-Party Providers

### Blockscout (Block Explorer API)

Blockscout is an open-source blockchain explorer for EVM chains. The app uses it as both a user-facing block explorer (linking to transactions) and a server-side data source for fetching on-chain event logs.

**How it's used:**
- Fetches `ProposalCreated` event logs from the Governor contract via the Blockscout REST API (`/api?module=logs&action=getLogs`), with pagination and block range filtering. Results are cached for 60 seconds.
- Resolves ENS/RNS domain names for addresses via the address lookup API (`/api/v2/addresses/{address}`), cached for 30 seconds.
- Acts as a fallback data source for proposals when The Graph is unavailable.

**Config:** `NEXT_PUBLIC_BLOCKSCOUT_URL`
| Environment | URL |
|-------------|-----|
| Mainnet | `https://rootstock.blockscout.com` |
| Testnet | `https://rootstock-testnet.blockscout.com` |

**Key files:** `src/app/proposals/actions/getProposalsFromBlockscout.ts`, `src/lib/rns.ts`, `src/lib/constants.ts`

---

### The Graph (Subgraph Indexing)

The Graph is a decentralized indexing protocol for querying blockchain data via GraphQL. The app uses two separate subgraphs for governance and rewards data.

**How it's used:**
- **DAO Governance Subgraph** — queries proposal data, voting records, and governance events. This is the primary data source for the proposals page.
- **Collective Rewards (CR) Subgraph** — queries builder allocations, reward cycles, backer data, and distribution events.
- Apollo Client handles GraphQL queries client-side. Server-side API routes also query The Graph directly.
- Gated behind feature flag `NEXT_PUBLIC_ENABLE_FEATURE_USE_THE_GRAPH=true`. When disabled, the app falls back to Blockscout for proposal data.

**Config:** `NEXT_PUBLIC_THE_GRAPH_CR_SUBGRAPH_URL`, `NEXT_PUBLIC_THE_GRAPH_DAO_SUBGRAPH_URL`
| Subgraph | Mainnet | Dev/Testnet |
|----------|---------|-------------|
| CR | `gateway.thegraph.com/api/[KEY]/deployments/id/Qm...` | `api.studio.thegraph.com/query/.../version/latest` |
| DAO | `gateway.thegraph.com/api/[KEY]/deployments/id/Qm...` | `api.studio.thegraph.com/query/.../version/latest` |

**Key files:** `src/lib/the-graph.ts`, `src/app/proposals/actions/getProposalsFromTheGraph.ts`, `src/app/proposals/hooks/useGetProposalsWithGraph.ts`

---

### RIF Wallet Services (Backend API)

RIF Wallet Services (RWS) is the Rootstock Collective backend that provides aggregated on-chain data including token balances, NFT ownership, token prices, event logs, and staking history. It serves as the primary REST API for most data needs.

**How it's used:**
- Token data: `GET /address/{address}/tokens` — fetches token balances for a wallet.
- Price feeds: `GET /price?addresses={addresses}&convert={currency}` — returns token prices.
- NFT queries: `GET /address/{address}/nfts/{nftAddress}` and `GET /nfts/{nftAddress}` — ownership and metadata.
- Holder data: `GET /address/{address}/holders` and `GET /nfts/{address}/holders`.
- Event logs: filtered by `topic0` for on-chain event lookups.
- Staking history: `GET /api/staking/v1/addresses/{address}/history`.
- Configured as an Axios instance with automatic `chainId` parameter injection.
- Local development uses a CORS bypass proxy (`/cors_bypass` route in Next.js) to avoid cross-origin issues.

**Config:** `NEXT_PUBLIC_RIF_WALLET_SERVICES`
| Environment | URL |
|-------------|-----|
| Mainnet | `https://rws.app.rootstockcollective.xyz` |
| Dev | `https://dev.rws.app.rootstockcollective.xyz` |
| Fork/Local | `http://localhost:3000/cors_bypass` (proxied to dev) |

**Key files:** `src/lib/constants.ts`, `src/lib/utils/utils.ts`, `src/lib/endpoints.ts`

---

### Pinata (IPFS Gateway)

Pinata is a managed IPFS pinning service. The app uses Pinata's dedicated gateway to serve decentralized content (NFT metadata, images, proposal attachments) over HTTPS with image optimization.

**How it's used:**
- Constructs gateway URLs from IPFS CIDs via `ipfsGatewayUrl()` — converts `ipfs://Qm...` URIs to `https://<gateway>/ipfs/Qm...`.
- On-the-fly image optimization via Pinata query parameters: width, height, format (webp), quality.
- Fetches NFT metadata JSON from IPFS via `fetchIpfsNftMeta()`.
- Optional authenticated access using `NEXT_PUBLIC_PINATA_GATEWAY_KEY` for private/gated content.
- Next.js `remotePatterns` in `next.config.mjs` allows image optimization for the Pinata domain.

**Config:** Gateway host `red-legislative-meadowlark-461.mypinata.cloud`, optional `NEXT_PUBLIC_PINATA_GATEWAY_KEY`

**Key files:** `src/lib/ipfs.ts`, `src/components/IpfsAvatar/IpfsAvatar.tsx`, `next.config.mjs`

---

### Discourse (Governance Forum)

Discourse is an open-source forum platform. The RootstockCollective governance forum hosts discussion threads linked to DAO proposals. The app fetches topic content server-side and extracts embedded videos.

**How it's used:**
- Server-side proxy at `GET /api/discourse/topic?url={discourse_url}` or `?topicId={id}` fetches topic JSON from the Discourse API (`/t/{topicId}.json`). This avoids CORS issues from the client.
- Responses are cached for 5 minutes (300s).
- Extracts embedded video URLs from topic posts (YouTube, Vimeo, Loom, Twitch) for inline playback in the proposals UI.
- Parses Discourse URLs to extract topic IDs.
- User-Agent header: `RootstockCollective-DAO-Frontend`.

**Config:** Forum base URL `https://gov.rootstockcollective.xyz` (same for all environments)

**Key files:** `src/lib/discourse.ts`, `src/app/api/discourse/topic/route.ts`, `src/shared/hooks/useDiscourseTopic.ts`, `src/shared/hooks/useDiscourseVideo.ts`, `src/lib/video.ts`

---

### Reown AppKit / WalletConnect (Wallet Connection)

Reown AppKit (formerly WalletConnect) provides a unified wallet connection modal supporting 300+ wallets. It handles QR code pairing, deep linking, and session management across desktop and mobile wallets.

**How it's used:**
- Central wallet connection layer via `@reown/appkit` and `@reown/appkit-adapter-wagmi`.
- Configured with a WalletConnect Project ID for relay server access.
- Wagmi adapter bridges AppKit with the Wagmi React hooks ecosystem for contract reads/writes.
- Supports additional hardware wallet connectors: Ledger (`@ledger-connector`) and Trezor (`@trezor/connect-web`).
- Cookie-based storage persists wallet session state for SSR hydration.
- Metadata (app name, URL, icons) is environment-specific for proper wallet display.

**Config:** `NEXT_PUBLIC_WC_PROJECT_ID=1d97c3632e7aa07c9ca422c71125184a`

**Key files:** `src/config/config.ts`, `src/shared/walletConnection/connection/ConnectWalletProvider.tsx`, `src/app/providers/ContextProviders.tsx`

---

### Uniswap V3 (DEX — Primary)

Uniswap V3 is the dominant decentralized exchange protocol. The app integrates directly with Uniswap V3 smart contracts deployed on Rootstock for token swaps.

**How it's used:**
- **Quoting:** Calls `QuoterV2` contract (`quoteExactInputSingle`, `quoteExactOutputSingle`) to get swap prices. Iterates through fee tiers (0.01%, 0.05%, 0.3%, 1%) to find the best rate.
- **Execution:** Calls `UniversalRouter.execute()` with the `V3_SWAP_EXACT_IN` command to perform swaps.
- **Permit2:** Uses Uniswap's Permit2 contract (Rootstock-specific deployment) for gasless token approvals via EIP-712 signatures — users sign a permit instead of submitting a separate `approve` transaction.
- Default fee tier is 100 (0.01%) optimized for the USDT0/USDRIF pool.

**Contracts (Mainnet):**
| Contract | Address |
|----------|---------|
| QuoterV2 | `0xb51727c996C68E60F598A923a5006853cd2fEB31` |
| Universal Router | `0x244f68e77357f86a8522323eBF80b5FC2F814d3E` |
| Permit2 | `0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5` |

**Key files:** `src/lib/swap/providers/uniswap.ts`, `src/lib/swap/constants.ts`, `src/lib/swap/permit2.ts`, `src/lib/abis/UniswapQuoterV2Abi.ts`, `src/lib/abis/UniswapUniversalRouterAbi.ts`

---

### IceCreamSwap (DEX — Secondary)

IceCreamSwap is a DEX deployed on Rootstock. It serves as an alternative swap provider alongside Uniswap, giving users access to additional liquidity pools.

**How it's used:**
- Configured as a swap provider in the aggregation layer alongside Uniswap.
- Contract interaction follows the same Uniswap-compatible router pattern.
- The swap UI compares quotes from both providers and routes through whichever offers the better rate.

**Contracts (Mainnet):** Router `0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c`

**Key files:** `src/lib/swap/constants.ts`, `src/lib/swap/providers/`

---

### RNS — Rootstock Name Service (Domain Resolution)

RNS is the Rootstock equivalent of ENS (Ethereum Name Service). It maps human-readable `.rsk` domain names to Rootstock addresses.

**How it's used:**
- Resolves `.rsk` domain names to addresses via `resolveRnsDomain()` using the `@rsksmart/rns-sdk` package.
- `isRnsDomain()` validates whether an input string is a `.rsk` domain.
- Used in address input fields — users can type `alice.rsk` instead of a hex address.
- Also queries Blockscout's address API to look up reverse ENS names for display.
- Integrated into form validation via `useFormAddressResolution` hook.

**Contracts:**
| Environment | Registry Address |
|-------------|-----------------|
| Mainnet | `0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5` |
| Testnet | `0x7d284aaac6e925aad802a53c0c69efe3764597b8` |

**Key files:** `src/lib/rns.ts`, `src/shared/hooks/useFormAddressResolution.ts`

---

### Google Tag Manager (Analytics)

GTM is Google's tag management system for deploying analytics and marketing tags without code changes.

**How it's used:**
- Initialized server-side in the root layout (`src/app/layout.tsx`) via `@next/third-parties/google`.
- Includes a `<noscript>` iframe fallback for tracking users without JavaScript.
- Tracks page views, user interactions, and custom events across the dApp.

**Config:** GTM ID `GTM-PTL6VZMT`

**Key files:** `src/app/layout.tsx`, `src/lib/constants.ts`

---

### PostgreSQL — State Sync Database

A PostgreSQL database that stores indexed blockchain state data, providing faster queries than direct RPC calls or The Graph for frequently accessed on-chain data.

**How it's used:**
- Read-only access to pre-indexed blockchain state (blocks, events, contract state).
- Health check endpoint monitors block number staleness (threshold: 8,000,000 blocks).
- Gated behind feature flag `NEXT_PUBLIC_ENABLE_FEATURE_USE_STATE_SYNC=true`.
- Used as a supplement or alternative to The Graph for certain data queries.
- Knex.js query builder with optional SSL (RDS CA certificate).

**Config:** `DB_CONNECTION_STRING`

**Key files:** `src/lib/db.ts`, `src/app/api/health/strategies/lastBlockNumber.ts`

---

### PostgreSQL — DAO Data Database

A separate PostgreSQL database dedicated to user-generated data that is **not** derived from blockchain state. Kept separate from the state-sync database to protect against data loss from blockchain reorgs.

**How it's used:**
- Stores user likes/votes on proposals and builders.
- Persists backer allocation preferences.
- Stores builder registry metadata.
- Manages user preferences and settings.
- Accessed through Next.js API routes (`/api/like`, `/api/allocations`, `/api/builders`, `/api/backers`).
- Knex.js with migration support (`src/db/migrations/`).

**Config:** `DAO_DATA_DB_CONNECTION_STRING`

**Key files:** `src/lib/daoDataDb.ts`, `src/db/migrations/`

---

### GitHub Raw Content (NFT Boost Data)

GitHub's raw content CDN is used to host NFT boost configuration data that determines staking multipliers for different NFT collections.

**How it's used:**
- Fetches NFT boost data from `https://raw.githubusercontent.com/RootstockCollective/dao-frontend/boost_data/{env}/nft_boost_data`.
- Environment-specific paths: `/mainnet/`, `/dev/`, `/testnet.local/`.
- Data determines which NFTs qualify for staking boosts and their multiplier values.

**Key files:** `src/lib/constants.ts`

---

### Video Platforms (Embedded Media)

The app extracts and embeds video content from multiple platforms found in Discourse proposal discussion threads.

**Supported platforms:**
| Platform | URL Pattern | Embed Format |
|----------|------------|--------------|
| YouTube | `youtube.com/watch`, `youtu.be/` | `youtube.com/embed/{id}` |
| Vimeo | `vimeo.com/{id}` | `player.vimeo.com/video/{id}` |
| Loom | `loom.com/share/{id}` | `loom.com/embed/{id}` |
| Twitch | `twitch.tv/videos/{id}` | `player.twitch.tv/?video={id}&parent={host}` |
| Rumble | `rumble.com/v{id}` | Disabled (requires server-side embed ID mapping) |

**How it's used:**
- Videos are extracted from Discourse topic post HTML content.
- Parsed into structured metadata (platform, videoId, embedUrl, thumbnail).
- Rendered as embedded iframes in the proposal detail view.

**Key files:** `src/lib/video.ts`, `src/shared/hooks/useDiscourseVideo.ts`

---

### Anvil / Foundry (Local Fork)

Anvil is a local Ethereum node from the Foundry toolkit. It creates a fork of Rootstock mainnet for local development and testing without spending real funds.

**How it's used:**
- `npm run fork:anvil` starts a local Anvil instance forking Rootstock mainnet.
- Runs on `http://127.0.0.1:8545` with chain ID `31337`.
- Provides full mainnet state locally — real contract addresses, balances, and liquidity pools.
- Dedicated `.env.fork` config points all services to local or dev equivalents.
- Used primarily for testing swap execution against real DEX liquidity without spending funds.
- Vitest has a dedicated "fork" test project for swap tests that require Anvil.

**Config:** `PROFILE=fork`, RPC `http://127.0.0.1:8545`, Chain ID `31337`

**Key files:** `.env.fork`, `docs/FORK_SETUP.md`, `vitest.config.ts`

---

### External Reference Links

The app links out to several external services for user-facing actions that happen outside the dApp:

| Service | Purpose | URL |
|---------|---------|-----|
| RNS Manager | Register/manage `.rsk` domains | `manager.rns.rifos.org` |
| Token Bridge | Bridge tokens to/from Rootstock | `tokenbridge.rsk.co` |
| CoinGecko | RIF token market data | `coingecko.com/en/coins/rsk-infrastructure-framework` |
| Google Forms | User feedback collection | `docs.google.com/forms/d/e/...` |
| Rootstock Wiki | Documentation and guides | `wiki.rootstockcollective.xyz` |

## Related Repositories

- **DAO Contracts**: https://github.com/RootstockCollective/dao-contracts
- **CR Smart Contracts**: https://github.com/RootstockCollective/collective-rewards-sc
- **Backend Services**: https://github.com/RootstockCollective/dao-backend-services

## Code Conventions

- **Node.js**: Version 24 LTS
- **Formatting**: Prettier (no semicolons, single quotes disabled)
- **Linting**: ESLint with Next.js + Storybook plugins
- **Git Hooks**: Husky pre-commit
- **Z-Index**: Semantic classes only (`z-base=1`, `z-dropdown=100`, `z-sticky=200`, `z-modal=500`, `z-tooltip=1000`)
- **TypeScript**: Strict mode, path aliases `@/*` -> `./src/*`
- **Components**: PascalCase, co-located tests/stories
- **CSS**: Tailwind CSS with custom theme in `src/theme/`

## Key Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers + GTM |
| `src/app/providers/ContextProviders.tsx` | All React context providers |
| `src/config/config.ts` | Wagmi/Viem wallet + chain config |
| `src/lib/constants.ts` | Global constants, token addresses, chain IDs |
| `src/lib/daoDataDb.ts` | PostgreSQL database client |
| `src/lib/endpoints.ts` | API endpoint definitions |
| `src/shared/walletConnection/` | Wallet connection provider + hooks |
| `next.config.mjs` | Next.js build/runtime config |
| `vitest.config.ts` | Unit test config (multi-project) |

## Formatting & Style Rules

These rules are enforced by Prettier, ESLint, and Husky pre-commit hooks. Code that violates them will be rejected.

| Rule | Value | Example |
|------|-------|---------|
| Semicolons | None | `const x = 1` not `const x = 1;` |
| Quotes | Single | `'string'` not `"string"` |
| Arrow parens | Avoid for single param | `x => x` not `(x) => x` |
| Trailing commas | All | `{ a, b, }` |
| Print width | 110 characters | |
| Indentation | 2 spaces | |
| Bracket spacing | Yes | `{ x }` not `{x}` |
| Unused variables | Prefix with `_` | `_unused` is allowed, `unused` errors |
| EOL | Always newline at end of file | |

**Config files:** `.prettierrc`, `.eslintrc.json`, `tsconfig.json`

## Import Conventions

- **Always** use `@/` path aliases. Never use relative imports.
  ```typescript
  // CORRECT
  import { Button } from '@/components/Button'
  import { STRIF_ADDRESS } from '@/lib/constants'

  // WRONG — never do this
  import { Button } from '../../../components/Button'
  ```
- **Type imports** use `import type` or inline `type` keyword:
  ```typescript
  import type { Address } from 'viem'
  import { Button, type ButtonProps } from '@/components/Button'
  ```
- **Barrel exports are selective** — not all modules re-export from `index.ts`. If a hook isn't in `@/shared/hooks`, import directly from its file: `@/shared/hooks/useVoteOnProposal`.

## Data Fetching Patterns

| Layer | When to Use | Key File(s) |
|-------|-------------|-------------|
| **React Query** (`useQuery`) | REST API calls, polled data (quotes, prices) | `src/shared/hooks/useSwapQuote.ts` |
| **Wagmi** (`useReadContract`) | On-chain contract reads (balances, states) | `src/shared/hooks/useStRif.ts` |
| **Wagmi** (`useWriteContract`) | On-chain transactions (vote, stake, swap) | `src/shared/hooks/useVoteOnProposal.ts` |
| **Apollo Client** | GraphQL queries (The Graph subgraphs) | `src/lib/the-graph.ts` |
| **Direct `fetch`** | Server-side only (API routes, server actions) | `src/app/api/` |

### React Query Pattern

```typescript
return useQuery<SwapQuoteResponse>({
  queryKey: ['swapQuote', tokenInAddress, tokenOutAddress, amount],
  queryFn: async () => { /* fetch logic */ },
  // CRITICAL: Validate all inputs before enabling the query
  enabled: enabled && !!amount && isAddress(tokenInAddress) && isAddress(tokenOutAddress),
  staleTime: 30_000,       // Cache duration (30s for quotes)
  refetchInterval: 60_000, // Polling interval (60s)
})
```

### Wagmi Read Pattern

```typescript
// CRITICAL: Condition on `address` to prevent reads before wallet connection
const { data } = useReadContracts(
  address && {
    contracts: [{ ...stRifContract, functionName: 'balanceOf', args: [address] }],
  },
)

// Always memoize derived state
return useMemo(() => {
  const [balance] = data ?? []
  return { stRifBalance: balance?.result ?? 0n }
}, [data])
```

### Key Rules

- Always use `enabled` parameter on `useQuery` — omitting it causes calls with invalid inputs.
- Always condition Wagmi reads on `address` — prevents reads before wallet connection.
- Always validate read state before allowing writes (e.g., check proposal is active before voting).
- Use `refetchInterval` for time-sensitive data; do NOT show loading spinners on refetches (only on initial load).

## Transaction Execution Pattern

All contract writes **must** use `executeTxFlow` for consistent UX. Located at `src/shared/notification/executeTxFlow.ts`.

```typescript
const txHash = await executeTxFlow({
  action: 'voting',           // Maps to TX_MESSAGES for toast text
  onRequestTx: () =>          // Contract write function (returns Hash)
    castVote({
      abi: GovernorAbi,
      address: GovernorAddress,
      functionName: 'castVote',
      args: [proposalId, voteChoice],
    }),
  onPending: (txHash) => {},   // Called when tx submitted
  onSuccess: (txHash) => {},   // Called after confirmation
  onError: (txHash, err) => {},// Called on failure
  onComplete: (txHash) => {},  // Always called (finally)
})
```

This automatically handles:
- Pending → success → error toast transitions via `TX_MESSAGES` (`src/shared/txMessages.ts`)
- Transaction receipt confirmation via `waitForTransactionReceipt`
- Silent suppression of user-rejected wallet transactions (no error toast)
- Explorer link in toast notifications

**Never** write manual toast/error handling for transactions.

## Toast Notification System

Uses `react-toastify` with custom wrappers in `src/shared/notification/toastUtils.tsx`.

```typescript
// Show a toast
const toastId = showToast({ severity: 'success', title: 'Done', content: 'Vote recorded' })

// Update an existing toast (e.g., pending → success)
updateToast(toastId, { severity: 'success', title: 'Done', content: 'Vote recorded', loading: false })
```

| Severity | Auto-close | Use Case |
|----------|------------|----------|
| `pending` | 120s | Transaction in progress |
| `success` | 10s | Confirmation |
| `error` | 10s | Failure |
| `warning` | 10s | Non-critical alerts |

**Key rule:** Never show error toast for user-rejected wallet transactions — `executeTxFlow` handles this automatically.

## Component Conventions

Beyond PascalCase naming and co-located tests/stories:

- **Always export the Props type** alongside the component:
  ```typescript
  export const Button: FC<Props> = ({ variant = 'primary', ...props }) => { /* ... */ }
  export type ButtonProps = Props
  ```
- **Always spread `{...props}`** on the root DOM element. This is required for wrapper components (Tooltip, Popover) to inject their props:
  ```typescript
  <button {...props}>{children}</button>
  ```
- **Extend HTML attributes** for native element compatibility:
  ```typescript
  interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
  }
  ```
- **Use parameter defaults**, never `defaultProps`.
- **Use variant-based styling** (semantic: `primary`, `secondary`), not color-based.
- **Use semantic color tokens** (`text-100`, `bg-100`, `primary`, `disabled-primary`), never literal colors.

## State Management (Zustand)

### Store with Devtools

```typescript
export const useSwapStore = create<SwapStore>()(
  devtools(
    set => ({
      ...initialState,
      setTokenIn: (token) =>
        set(
          { tokenIn: token, typedAmount: '', swapError: null },
          false,          // Don't replace entire state
          'setTokenIn',   // Action name for devtools
        ),
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'SwapStore' },
  ),
)
```

### Store with Persistence + Immer

```typescript
export const useSiweStore = create<SiweState>()(
  persist(
    immer(set => ({
      jwtToken: null,
      setToken: (token) => {
        set(state => { state.jwtToken = token })  // Immer: direct mutation
      },
    })),
    { name: 'siwe-storage' },  // localStorage key
  ),
)

// Export selectors for derived state
export const selectIsAuthenticated = (state: SiweState) =>
  !!state.jwtToken && !isTokenExpired(state.jwtToken)
```

### Conventions

| Convention | Example |
|-----------|---------|
| Action naming | `set[X]`, `clear[X]`, `toggle[X]`, `reset` |
| Always clear error state on new actions | `swapError: null` in every setter |
| Always pass action name to `set()` | Third param: `'setTokenIn'` |
| Export selectors for computed state | `selectIsAuthenticated` |
| Use `devtools` middleware on all stores | Enables Redux DevTools debugging |
| Use `persist` for data that survives refresh | Auth tokens, user preferences |
| Use `immer` for complex nested state | Enables direct mutation syntax |

## API Route Patterns

### Response Format

```typescript
// Success
{ success: true, ...data }                    // 200

// Validation error
{ success: false, error: 'Validation failed', details: zodErrors }  // 400

// Auth error (returned by withAuth)
{ error: 'Unauthorized' }                     // 401

// Service unavailable
{ success: false, error: 'Database not configured' }                // 503

// Server error
{ success: false, error: 'Internal server error' }                  // 500
// Dev-only: includes `message` with error details
```

### Authentication Middleware

Protected endpoints use `withAuth()` from `src/lib/auth/withAuth.ts`:

```typescript
export const POST = withAuth(async (request, session: JWTPayload) => {
  const { userAddress } = session  // Guaranteed valid
  // ... route logic
})
```

Token sources (checked in order):
1. `Authorization: Bearer <token>` header
2. `auth-token=<token>` cookie

### Validation

Use Zod for request body validation:

```typescript
const Schema = z.object({
  proposalId: z.string().min(1).refine(val => { try { BigInt(val); return true } catch { return false } }),
  reaction: z.enum(['heart']).default('heart'),
})
```

### Database Operations

- Always normalize addresses to lowercase before storage.
- Use `daoDataDb.transaction()` for read-then-write operations (prevents race conditions).
- Store BigInt values as 32-byte padded BYTEA buffers:
  ```typescript
  function bigIntToBuffer(value: string): Buffer {
    let hex = BigInt(value).toString(16)
    hex = hex.padStart(64, '0')  // 64 hex chars = 32 bytes = uint256
    return Buffer.from(hex, 'hex')
  }
  ```
- Use `revalidate` export for response caching: `export const revalidate = 30`

## Authentication Flow (SIWE + JWT)

**Key files:** `src/shared/hooks/useSignIn.ts`, `src/lib/auth/withAuth.ts`, `src/lib/auth/siweStore.ts`, `src/lib/auth/jwt.ts`

### Sign-In Flow

1. Client calls `requestChallenge(address)` → server generates SIWE message with nonce, expiry, chain ID
2. User signs the message with their wallet (`signMessageAsync`)
3. Client calls `verifySignature(challengeId, signature)` → server verifies and returns JWT
4. JWT stored in Zustand (`useSiweStore`) → persisted to localStorage

### Security Rules

- Challenges are **server-generated only** — never create SIWE messages client-side.
- Challenges are **one-time use** — deleted after verification.
- Challenges expire after 10 minutes.
- JWTs expire after 24 hours.
- JWT payload contains `{ userAddress, iat, exp }`.

### Authentication State

```typescript
const isAuthenticated = useSiweStore(selectIsAuthenticated)  // Checks token exists + not expired
const userAddress = useSiweStore(selectUserAddress)           // Extracts from JWT payload
```

## Feature Flag System

**Key files:** `src/config/features.conf.ts`, `src/shared/context/FeatureFlag/`, `src/lib/constants.ts`

### Defining Flags

1. Add to `src/config/features.conf.ts`:
   ```typescript
   const features = {
     my_feature: 'Description of the feature',
     // ...existing flags
   } as const
   ```

2. Map to env var in `src/lib/constants.ts`:
   ```typescript
   const FEATURE_FLAGS: Record<Feature, string> = {
     my_feature: process.env.NEXT_PUBLIC_ENABLE_FEATURE_MY_FEATURE ?? '',
   }
   ```

3. Set in `.env.*` files:
   ```bash
   NEXT_PUBLIC_ENABLE_FEATURE_MY_FEATURE=true
   ```

### Checking Flags in Components

```typescript
const { flags } = useFeatureFlags()
if (!flags.my_feature) return null  // or <OldVersion />
```

### Flag Types

| Type | Env Value | Description |
|------|-----------|-------------|
| Boolean flag | `"true"` / `"false"` | Enables/disables a feature |
| User-toggleable flags | Comma-separated list | `NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS=v2_rewards,debug_logs` |

Environment flags always take precedence over localStorage-persisted user toggles.

## Environment Variable Conventions

| Category | Prefix | Example |
|----------|--------|---------|
| Client-accessible | `NEXT_PUBLIC_` | `NEXT_PUBLIC_CHAIN_ID` |
| Server-only | None | `JWT_SECRET`, `DAO_DATA_DB_CONNECTION_STRING` |
| Contract addresses | `NEXT_PUBLIC_{NAME}_ADDRESS` | `NEXT_PUBLIC_RIF_ADDRESS` |
| Feature flags | `NEXT_PUBLIC_ENABLE_FEATURE_{NAME}` | `NEXT_PUBLIC_ENABLE_FEATURE_VAULT` |
| Service URLs | `NEXT_PUBLIC_{SERVICE}` | `NEXT_PUBLIC_RIF_WALLET_SERVICES` |

All contract addresses are centralized in `src/lib/constants.ts` — never hardcode addresses in components.

### Endpoint Templates

API endpoint URLs use `{{placeholder}}` syntax in `src/lib/endpoints.ts`:
```typescript
export const fetchAddressTokensEndpoint =
  '/address/{{address}}/tokens?chainId={{chainId}}'
// Replaced at call site: endpoint.replace('{{address}}', userAddress)
```

## Database Architecture

### Dual Database Setup

| Database | Env Var | Purpose | Writeable |
|----------|---------|---------|-----------|
| State-Sync | `DB_CONNECTION_STRING` | Indexed blockchain state (blocks, events) | Read-only |
| DAO Data | `DAO_DATA_DB_CONNECTION_STRING` | User-generated data (likes, preferences) | Read-write |

Kept separate so blockchain reorgs (which reset state-sync) don't destroy user data.

### Migration Conventions

- Located in `src/db/migrations/`
- All DDL uses `IF NOT EXISTS` (idempotent, safe for re-runs)
- No destructive operations (`DROP`, `ALTER COLUMN`)
- Run on container startup: `node src/db/migrate.js` (errors logged but non-blocking)
- Schema: `dao_data`
- Addresses stored as lowercase `VARCHAR(42)`
- Proposal IDs stored as `BYTEA` (32-byte padded BigInt)

### Knex.js Client

```typescript
// src/lib/daoDataDb.ts — returns undefined if DB not configured
import { daoDataDb } from '@/lib/daoDataDb'

// Always check availability
if (!daoDataDb) {
  return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
}
```

## Provider Nesting Order

The order in `src/app/providers/ContextProviders.tsx` is critical — each provider depends on its ancestors:

```
GlobalErrorBoundary          ← Catches all errors
  └─ FeatureFlagProvider     ← Needed by many downstream components
      └─ WagmiProvider       ← Blockchain connection
          └─ QueryClientProvider  ← Data fetching (needs Wagmi for contract calls)
              └─ ConnectWalletProvider
                  └─ BuilderContextProviderWithPrices
                      └─ BoosterProvider
                          └─ AllocationsContextProvider
                              └─ BalancesProvider
                                  └─ TooltipProvider
                                      └─ {children}
```

## Design System / Theme

### Theme Files (`src/theme/`)

| File | Purpose |
|------|---------|
| `base.css` | Foundational resets and base styles |
| `default.css` | Default theme (original design) |
| `design_v3.css` | V3 Koto-based design (behind `v3_design` flag) |
| `markdown-editor.css` | Editor-specific styles |

### Semantic Z-Index (Never Use Magic Numbers)

| Class | Value | Use Case |
|-------|-------|----------|
| `z-base` | 1 | Default layer |
| `z-dropdown` | 100 | Dropdowns, temporary overlays |
| `z-sticky` | 200 | Sticky headers, floating elements |
| `z-modal` | 500 | Modal overlays, dialogs |
| `z-tooltip` | 1000 | Tooltips (highest layer) |

## Testing

### Framework: Vitest (NOT Jest)

```typescript
import { describe, it, expect, vi } from 'vitest'      // NOT from 'jest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
```

### Three Test Projects (`vitest.config.ts`)

| Project | Chain ID | Environment | Scope |
|---------|----------|-------------|-------|
| Default | 31 (testnet) | jsdom | All tests except swap |
| Mainnet | 30 | jsdom | Swap quote tests only |
| Fork | 31337 (Anvil) | jsdom | Swap execution tests (requires `FORK_RPC_URL`) |

API route tests use `node` environment (not jsdom) — configured via `environmentMatchGlobs`.

### Test File Location

Same directory as source file: `ComponentName.test.tsx` or `functionName.test.ts`

### Mock Patterns

```typescript
// Module mock
vi.mock('@/shared/hooks/useStRif')

// Access mocked function
const mockedHook = vi.mocked(useStRif)
mockedHook.mockReturnValue({ stRifBalance: 100n })

// Implementation mock
vi.mocked(fetchData).mockResolvedValueOnce(testData)
```

### API Route Testing

```typescript
import { GET } from './route'
import { NextRequest } from 'next/server'

const url = new URL('http://localhost/api/health')
url.searchParams.set('type', 'lastBlockNumber')
const request = new NextRequest(url)

const response = await GET(request, { params: Promise.resolve({ type: 'lastBlockNumber' }) })
expect(response.status).toBe(200)
```

### BigInt in Tests

```typescript
// Helper for JSON serialization of BigInt
const safeStringify = (obj: any) =>
  JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
```

## Git Hooks & CI Pipeline

### What Blocks Your Code

| Trigger | What Runs | Blocks If Fails |
|---------|-----------|-----------------|
| **Pre-commit** | ESLint + TypeScript type check | Commit blocked |
| **Pre-push** | Vitest (excl. swap) + Next.js build | Push blocked |
| **PR (CI)** | Lint + TypeScript + E2E (Cypress) + Docker build + Unit tests (all 3 projects) | Merge blocked |

### CI Details

- Unit tests start an **Anvil fork** automatically for swap execution tests
- E2E runs Cypress on Chrome against `localhost:3000`
- Build uses Docker with `PROFILE=testnet.local`
- All workflows use `permissions: read-all` (least privilege)

### Hook Files

| Hook | File | Commands |
|------|------|----------|
| Pre-commit | `.husky/pre-commit` | `npm run lint && npm run lint-tsc` |
| Pre-push | `.husky/pre-push` | Vitest (excl. swap) + `PROFILE=dev npm run build` |

## Common Pitfalls for AI Agents

1. **Forgetting `enabled` on `useQuery`** — causes API calls with invalid/empty inputs
2. **Not conditioning Wagmi reads on `address`** — causes reads before wallet is connected
3. **Not using `executeTxFlow`** — leads to inconsistent toast/error handling across the app
4. **Not wrapping protected API routes with `withAuth()`** — leaves endpoints unauthenticated
5. **Not using Knex transactions** for read-then-write DB operations — causes race conditions
6. **Hardcoding contract addresses** — breaks when switching between mainnet/testnet/fork
7. **Using `jest` APIs** — the project uses Vitest (`vi.mock`, `vi.mocked`, not `jest.mock`)
8. **Using relative imports** — always use `@/` path aliases
9. **Not checking feature flags** — new features must be gated appropriately
10. **Not padding BigInt to 32 bytes** — causes BYTEA comparison failures in PostgreSQL
11. **Showing loading spinners on refetch** — only block rendering on initial load, not subsequent polls
12. **Showing error toast for user-rejected transactions** — `executeTxFlow` handles this silently
13. **Creating SIWE challenges client-side** — security vulnerability; challenges must be server-generated
14. **Using magic z-index numbers** — use semantic classes (`z-modal`, `z-dropdown`, etc.)
15. **Not exporting component Props types** — consumers need them for type-safe composition
