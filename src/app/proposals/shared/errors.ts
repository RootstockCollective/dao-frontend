import { BaseError } from '@/components/ErrorPage/commonErrors'

export const NoVotingPowerError = new BaseError(
  'NoVotingPowerError',
  'You do not have enough voting power to create a proposal',
)
export const AddressNotWhitelistedError = new BaseError(
  'AddressNotWhitelistedError',
  'The submitted address is not whitelisted',
)
