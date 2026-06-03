# Devlog: Remove Vault & BTC-Vault — Phase 2

**Date:** 2026-05-20
**Phase:** 2 of 2
**Branch:** feat/remove-vaults

---

## What Was Planned

Remove vault references from all shared files that were not exclusively vault-owned.

## What Was Done

### Files modified

- **`src/components/MainContainer/sidebars/menuData.ts`** — removed `getBetaToolsSection()` and `getBetaToolsSectionNotConnected()` functions (and their `getEnvFlag` import), `RequiredRole` type, and `requiredRole` field from `MenuData` interface; removed spread calls from `menuData` and `menuDataNotConnected` arrays
- **`src/shared/constants/routes.ts`** — removed `btcVault`, `btcVaultRequestHistory`, `btcVaultDepositHistory`, and `btcVaultRequestDetail` route constants
- **`src/config/features.conf.ts`** — removed `vault` and `btc_vault` feature definitions
- **`src/lib/constants.ts`** — removed: `USDRIF_VAULT_ADDRESS`, `RBTC_VAULT_ADDRESS`, `DEPOSITOR_ROLE`, `WHITELISTED_USER_ROLE`, `VAULT_BASIS_POINTS`, `VAULT_SHARE_MULTIPLIER`, `VAULT_SHARE_DECIMALS`, `VAULT_KYC_URL`, `VAULT_TERMS_CONDITIONS_URL`, `VAULT_DEFAULT_SLIPPAGE_PERCENTAGE`, and `vault`/`btc_vault` entries in `FEATURE_FLAGS`
- **`src/shared/txMessages.ts`** — removed `vaultAllowance`, `vaultDeposit`, `vaultWithdraw`, `btcVaultClaim`, `btcVaultCancel`, `btcVaultDepositRequest`, `btcVaultWithdrawRequest`, `btcVaultDeWhitelist`, `btcVaultWhitelistGrant`, `pauseDeposits`, `pauseWithdrawals`, `resumeDeposits`, `resumeWithdrawals`, and `updateNav` message keys
- **`src/components/Breadcrumbs/Breadcrumbs.tsx`** — removed `/vault/history`, `/btc-vault`, `/btc-vault/request-history`, `/btc-vault/deposit-history` entries from `breadcrumbsMap`; removed `isBtcVaultDetail` regex special-case from the `useMemo`

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| `Breadcrumbs.tsx` added to Phase 2 | Missed in initial impact analysis | Low — dead breadcrumb entries for removed routes |

## Notes for Code Review

- `VAULT_SHARE_MULTIPLIER` was removed from `constants.ts` even though it wasn't flagged in the initial analysis — confirmed unused outside deleted vault code.
- `pauseDeposits`, `pauseWithdrawals`, `resumeDeposits`, `resumeWithdrawals`, `updateNav` tx message keys were used exclusively by `fund-admin` vault controls (deleted in Phase 1).
- No non-vault consumers of any removed constants or message keys were found.
