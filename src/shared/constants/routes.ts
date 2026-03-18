export const home = '/'
export const collectiveRewards = '/collective-rewards'
export const btcVault = '/btc-vault'
export const btcVaultRequestHistory = '/btc-vault/request-history'
export const btcVaultDepositHistory = '/btc-vault/deposit-history'
export const btcVaultRequestDetail = (id: string) => `/btc-vault/request-history/${id}` as const
