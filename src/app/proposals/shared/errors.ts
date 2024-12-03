import { BaseError } from '@/components/ErrorPage/commonErrors'

export const NoVotingPowerError = new BaseError(
  'NoVotingPowerError',
  'You do not have enough voting power to create a proposal',
)

export const AddressAlreadyWhitelistedError = new BaseError(
  'AddressAlreadyWhitelistedError',
  'The submitted address is already whitelisted',
)
