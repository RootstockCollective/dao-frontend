import Big from '@/lib/big'
import axios from 'axios'
import { BigSource } from 'big.js'
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Address } from 'viem'
import { CHAIN_ID, EXPLORER_URL, RIF_WALLET_SERVICES_URL } from '../constants'

/**
 * Merges Tailwind and clsx classes in order to avoid classes conflicts.
 * This is useful when you want to override default classes and/or add conditional classes.
 * https://www.youtube.com/watch?v=re2JFITR7TI
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const SHARED_MODAL_BOX_SHADOW_STYLE = '0px 0px 16.4px 0px rgba(229,107,26,0.68)'

/**
 * Shortens the address by keeping the first and last `amount` characters
 * @param address - The address to shorten
 * @param amount - The amount of characters to keep
 * @returns The shortened address
 * @example shortAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') // '0xf39F...92266'
 */
export const shortAddress = (address: Address | undefined, amount = 5): string => {
  if (!address) {
    return ''
  }
  return `${address.slice(0, amount + 1)}…${address.slice(-amount)}`
}

export const axiosInstance = axios.create({
  baseURL: RIF_WALLET_SERVICES_URL,
  params: {
    chainId: CHAIN_ID,
  },
})

axiosInstance.interceptors.request.use(
  config => {
    try {
      const fullUrl = config.baseURL + (config.url || '')
      const doesBaseUrlHasChainId = fullUrl.includes('chainId')
      if (doesBaseUrlHasChainId) {
        // Parse the full URL (baseURL + request URL)
        const url = new URL(fullUrl)

        // Get existing URL parameters
        const existingChainId = url.searchParams.get('chainId')

        // If there are params in the request config
        if (config.params) {
          // If chainId exists in both URL and params, remove it from params
          if (existingChainId && 'chainId' in config.params) {
            const { chainId, ...otherParams } = config.params
            config.params = otherParams
          }
        }
      }
      return config
    } catch (error) {
      console.error('Error in axios interceptor:', error)
      return config
    }
  },
  error => {
    return Promise.reject(error)
  },
)

/**
 * Truncates a string to a given length
 * @param str - The string to truncate
 * @param length - The length to truncate the string to
 * @returns The truncated string
 * @example truncate('Hello, world!', 5) // 'Hello...'
 */
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length) + '…'
}

/**
 * Truncates a string by keeping the first `start` characters and the last `end` characters
 * @param str - The string to truncate
 * @param start - The amount of characters to keep from the start
 * @param end - The amount of characters to keep from the end
 * @returns The truncated string
 * @example truncateMiddle('Hello, world!', 5, 5) // 'Hello...world!'
 */
export const truncateMiddle = (str: string, start = 10, end = 10): string => {
  if (str.length <= start + end) {
    return str
  }
  return str.slice(0, start) + '…' + str.slice(-end)
}

export const explorerURL = process.env.NEXT_PUBLIC_EXPLORER

export const goToExplorerWithTxHash = (hash: string) => window.open(`${EXPLORER_URL}/tx/${hash}`, '_blank')

/**
 * Sanitizes a number to a string representation
 * @param num - The number to sanitize
 * @returns The sanitized string representation of the number
 */
export const sanitizeInputNumber = (num: number) => {
  // If the number is not in scientific notation, return its standard string representation
  if (!/\d+\.?\d*e[+-]*\d+/i.test(num.toString())) {
    return num.toString()
  }

  // Convert the number to a string in standard form with a maximum of 18 decimal places
  // and remove trailing zeros
  let str = num.toFixed(18).replace(/\.?0+$/, '')

  // If the number is very small and gets converted to "0" after toFixed, handle it separately
  if (str === '0') {
    // Find the exponent to estimate the number of zeros
    const match = num.toString().match(/e-(\d+)/)
    const zeros = match ? parseInt(match[1], 10) - 1 : 0

    // Construct the string representation manually for very small numbers
    str =
      '0.' +
      '0'.repeat(zeros) +
      num
        .toString()
        .replace(/.*e-?\d+$/, '')
        .replace('.', '')
  }

  return str
}

/**
 * Formats a number as a currency
 * @param value - The number to format
 * @param currency - The currency to format the number as (default: 'USD')
 * @returns The formatted currency string
 * @example formatCurrency(123456.789) // '$123,456.79'
 * @example formatCurrency(123456.789, 'EUR') // '€123,456.79'
 * @example formatCurrency(0.0001) // '<$0.01'
 * @example formatCurrency(0) // '$0.00'
 */
export const formatCurrency = (value: BigSource, currency = 'USD'): string => {
  if (isNaN(Number(value))) {
    return ''
  }

  // ensure it is a Big
  try {
    value = Big(value.toString())
  } catch {
    return ''
  }

  let verySmallValue = value.gt(0) && value.lt(0.01)
  value = verySmallValue ? 0.01 : value

  const result = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toString() as never)

  return verySmallValue ? `<${result}` : result
}

/**
 * Formats a number with commas
 * @param num - The number to format
 * @returns The formatted number with commas
 * @example formatNumberWithCommas(123456789) // '123,456,789'
 * @example formatNumberWithCommas(1234567.89) // '1,234,567.89'
 * @example formatNumberWithCommas(0.000123) // '0.000123'
 */
export function formatNumberWithCommas(num: BigSource): string {
  if (isNaN(Number(num)) || num === '') {
    return ''
  }
  const parts = num.toString().split('.')
  parts[0] = new Intl.NumberFormat('en-US').format(Number(parts[0]))
  return parts.join('.')
}

/**
 * Creates a debounced version of a function that delays its execution until after a specified wait time
 * has elapsed since the last time it was called.
 * @param func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay execution
 * @param {boolean} [immediate=false] - If true,  function executes immediately on the first call, then waits for the delay before allowing subsequent calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>): void {
    const context = this

    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }
}

interface Denomination {
  value: number
  symbol: string
}
/**
 * A list of full-text denominations for large numbers, used when a more descriptive output is needed.
 * Example: `1,000,000` → `"Millions"`
 */
export const fullDenominations: Denomination[] = [
  { value: 1e12, symbol: 'Trillions' },
  { value: 1e9, symbol: 'Billions' },
  { value: 1e6, symbol: 'Millions' },
  { value: 1e3, symbol: 'Thousand' },
]
/**
 * A list of short-form denominations for large numbers, used for compact display.
 * Example: `1,000,000` → `"1M"`
 */
const shortDenominations: Denomination[] = [
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'K' },
]

/**
 * Formats a large number using denominations provided in `units` param.
 * @param num - The number to format, can be a BigSource or bigint.
 * @param separator - A string separator to place between the number and the unit (default: '').
 * @param units - An array of denominations to use for formatting (default: `shortDenominations`).
 * @returns The formatted string representation of the number with appropriate unit.
 * @example millify(936000000) // '936M'
 * @example millify(1372000000) // '1.372B'
 * @example millify(9876543210000) // '9.876T'
 * @example millify(1234) // '1.234K'
 * @example millify(3107.55) // '3.107K'
 * @example millify(1000) // '1K'
 * @example millify(-1234567890) // '-1.234B'
 * @example millify('1234567890') // '1.234B'
 * @example millify(1000000, ' ') // '1 M'
 * @example millify(1000000, ' ', fullDenominations) // '1 Millions'
 */
export function millify(num: BigSource | bigint, separator = '', units = shortDenominations): string {
  const bigNum = Big(typeof num === 'bigint' ? num.toString() : num)
  if (bigNum.lt(0)) return `-${millify(bigNum.abs())}`

  for (const unit of units) {
    if (bigNum.gte(unit.value)) {
      const divided = bigNum.div(unit.value)
      const rounded = divided.round(3, Big.roundDown)
      return formatNumberWithCommas(rounded) + separator + unit.symbol
    }
  }

  return formatNumberWithCommas(bigNum)
}

/**
 * Splits a string by inserting spaces between camelCase and PascalCase words.
 *
 * @param str - The input string to split
 * @returns The string with spaces inserted between word boundaries
 *
 * @example
 * splitWords("camelCase") // returns "camel Case"
 * splitWords("PascalCase") // returns "Pascal Case"
 * splitWords("ABCdef") // returns "AB Cdef"
 */
export function splitWords(str?: string) {
  return str ? str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2') : ''
}
