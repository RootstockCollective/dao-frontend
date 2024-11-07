export type ZeroAddressError = Error & {
  contractName: string
}

export const createZeroAddressError = <T extends {} = {}>(
  contractName: string,
  data?: T,
): ZeroAddressError => ({
  ...new Error(),
  message: `Contract ${contractName} has zero address. Data: ${data ? JSON.stringify(data, null, 2) : 'none'}`,
  contractName,
  name: 'ZeroAddressError',
  cause: data,
})
