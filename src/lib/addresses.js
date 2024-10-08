/**
 * Imported methods from: https://github.com/rsksmart/rsk-utils/blob/master/src/addresses.js
 */

/**
 * @description Check if a string is an address
 * @param {String} address
 * @returns {Boolean}
 */
export function isAddress(address) {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address)
}

/**
 * @description Validates address checksum
 * @param {String} address
 * @param {Integer|String} chainId
 * @returns {Boolean}
 */
export function isValidChecksumAddress(address, chainId) {
  return isAddress(address) && toChecksumAddress(address, chainId) === address
}

/**
 * @description Implements EIP-1191 Address Checksum
 * @param {String} address
 * @param {Integer|String} chainId
 * @returns {String} checksummed address
 */
export function toChecksumAddress(address, chainId) {
  address = stripHexPrefix(address).toLowerCase()
  chainId = parseInt(chainId)
  const prefix = !isNaN(chainId) ? `${chainId.toString()}0x` : ''
  const hash = keccak256(`${prefix}${address}`).toString('hex')
  return (
    '0x' +
    address
      .split('')
      .map((b, i) => (parseInt(hash[i], 16) >= 8 ? b.toUpperCase() : b))
      .join('')
  )
}
