/**
 * Shortens the address by keeping the first and last `amount` characters
 * @param address - The address to shorten
 * @param amount - The amount of characters to keep
 * @returns The shortened address
 * @example shortAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') // '0xf39F...92266'
 */
export const shortAddress = (address: string | undefined, amount = 5): string => {
  if (!address) {
    return ''
  }
  return `${address.slice(0, amount + 1)}...${address.slice(-amount)}`
}
