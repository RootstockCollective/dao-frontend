import { useBtcVaultEventsMock } from './useBtcVaultEvents.mock'
import { useBtcVaultEventsContract } from './useBtcVaultEvents.contract'

export const useBtcVaultEvents =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useBtcVaultEventsContract
    : useBtcVaultEventsMock
