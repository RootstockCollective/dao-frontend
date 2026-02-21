import type {
  BtcVaultService,
  BtcVaultServiceListener,
  ClaimableInfo,
  DepositRequestParams,
  EligibilityStatus,
  EpochState,
  PaginatedResult,
  PaginationParams,
  PauseState,
  TxResult,
  UserPosition,
  VaultMetrics,
  VaultRequest,
  WithdrawalRequestParams,
} from '../types'

const NOT_IMPLEMENTED = 'Not implemented — waiting for contract ABI'

export class ContractBtcVaultService implements BtcVaultService {
  getVaultMetrics(): Promise<VaultMetrics> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getEpochState(): Promise<EpochState> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getPauseState(): Promise<PauseState> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getUserPosition(_address: string): Promise<UserPosition> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getEligibility(_address: string): Promise<EligibilityStatus> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getActiveRequests(_address: string): Promise<VaultRequest[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getClaimableStatus(_requestId: string): Promise<ClaimableInfo> {
    throw new Error(NOT_IMPLEMENTED)
  }

  getRequestHistory(_address: string, _params: PaginationParams): Promise<PaginatedResult<VaultRequest>> {
    throw new Error(NOT_IMPLEMENTED)
  }

  submitDepositRequest(_params: DepositRequestParams): Promise<TxResult> {
    throw new Error(NOT_IMPLEMENTED)
  }

  submitWithdrawalRequest(_params: WithdrawalRequestParams): Promise<TxResult> {
    throw new Error(NOT_IMPLEMENTED)
  }

  finalizeDeposit(_epochId: string): Promise<TxResult> {
    throw new Error(NOT_IMPLEMENTED)
  }

  finalizeWithdrawal(_batchRedeemId: string): Promise<TxResult> {
    throw new Error(NOT_IMPLEMENTED)
  }

  subscribe(_listener: BtcVaultServiceListener): () => void {
    throw new Error(NOT_IMPLEMENTED)
  }

  dispose(): void {
    // No-op — nothing to clean up
  }
}
