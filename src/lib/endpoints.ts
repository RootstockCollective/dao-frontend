// keccak256('ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)')
export const PROPOSAL_CREATED_EVENT = '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'

export const getStakingHistoryEndpoint = `/api/staking/v1/addresses/{{address}}/history`

export const getVaultHistoryEndpoint = `/api/vault/v1/addresses/{{address}}/history`

export const getBtcVaultEpochHistoryEndpoint = `/api/btc-vault/v1/epoch-history`
export const getBtcVaultHistoryEndpoint = `/api/btc-vault/v1/history`
export const getBtcVaultWhitelistRoleHistoryEndpoint = `/api/btc-vault/v1/whitelist-role-history`
export const getFundAdminAuditLogEndpoint = `/api/fund-admin/v1/audit-log`
