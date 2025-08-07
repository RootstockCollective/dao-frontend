import Big from '@/lib/big'
import axios from 'axios'
import { BigSource } from 'big.js'
import { ClassValue, clsx } from 'clsx'
import { Duration } from 'luxon'
import { twMerge } from 'tailwind-merge'
import { Address, formatEther } from 'viem'
import { CHAIN_ID, EXPLORER_URL, RIF_WALLET_SERVICES_URL } from '../constants'

/**
 * Merges Tailwind and clsx classes in order to avoid classes conflicts.
 * This is useful when you want to override default classes and/or add conditional classes.
 * https://www.youtube.com/watch?v=re2JFITR7TI
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/**
 * Shortens the address by keeping the first and last `amount` characters
 * @param address - The address to shorten
 * @param amount - The amount of characters to keep
 * @returns The shortened address
 * @example shortAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb29266') // '0xf39F...9266'
 */
export const shortAddress = (address: Address | undefined, amount = 4): string => {
  if (!address) {
    return ''
  }
  const prefixLength = amount + 2 // 2 for '0x' prefix
  return `${address.slice(0, prefixLength)}…${address.slice(-amount)}`
}

export const shortProposalId = (proposalId: string): string => {
  return `${proposalId.slice(0, 12)}…${proposalId.slice(-12)}`
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
  if (!str) return ''
  if (str.length <= length) return str
  if (length <= 2) return str.slice(0, length)
  return str.slice(0, length - 2) + '…'
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

/**
 * Truncates a string by keeping the first `length` characters and the last 3 characters
 * @param str - The string to truncate
 * @param length - The amount of characters to keep from the start
 * @returns The truncated string
 * @example truncateRns('testverylongname.rsk', 5) // 'testv…rsk'
 * @example truncateRns('jesse.rsk', 5) // 'jesse.rsk'
 * @example truncateRns('jesse.rsk', 4) // 'jesse.rsk'
 * @example truncateRns('jesse.rsk', 3) // 'jes…rsk'
 */
export const truncateRns = (str: string, length: number): string => {
  if (!str) return ''
  if (str.length <= length + 5) return str
  return str.slice(0, length) + '…' + str.slice(-3)
}

type FormatCurrencyProps = {
  currency?: string
  showCurrencyLabel?: boolean
  showCurrencySymbol?: boolean
}

/**
 * Formats a number as a currency
 * @param amount - The number to format
 * @param props - The props to format the number
 * @param props.currency - The currency to format the number as (default: 'USD')
 * @param props.showCurrency - Whether to show the currency symbol (default: false)
 * @returns The formatted currency string
 * @example formatCurrency(123456.789) // '$123,456.79'
 * @example formatCurrency(123456.789, { currency: 'EUR' }) // '€123,456.79'
 * @example formatCurrency(0.0001) // '<$0.01'
 * @example formatCurrency(0) // '$0.00'
 * @example formatCurrency(123456.789, { showCurrency: true }) // '$123,456.79 USD'
 */
export const formatCurrency = (
  amount: BigSource,
  { currency = 'USD', showCurrencyLabel = false, showCurrencySymbol = true }: FormatCurrencyProps = {},
): string => {
  if (isNaN(Number(amount))) {
    return ''
  }

  // ensure it is a Big
  try {
    amount = Big(amount.toString())
  } catch {
    return ''
  }

  let isBelowMinimumDisplay = amount.gt(0) && amount.lt(0.01)
  amount = isBelowMinimumDisplay ? 0.01 : amount

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount.toString() as never)

  const result = isBelowMinimumDisplay ? `<${formattedAmount}` : formattedAmount
  return showCurrencyLabel ? `${result} ${currency}` : result
}

export const formatCurrencyWithLabel = (amount: BigSource, props: FormatCurrencyProps = {}): string => {
  return formatCurrency(amount, { showCurrencyLabel: true, ...props })
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

interface Denomination {
  value: number
  symbol: string
}
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

/**
 * Handles amount input changes with proper validation and formatting.
 * This function ensures that:
 * 1. The input is a valid number with up to 18 decimal places
 * 2. Leading zeros are removed
 * 3. Empty or invalid inputs are handled gracefully
 * 4. The value is properly formatted for blockchain transactions
 *
 * @param value - The input value to process
 * @param maxDecimals - Maximum number of decimal places (default: 18)
 * @returns The processed value, or '' if invalid/empty
 *
 * @example
 * handleAmountInput('123.456') // '123.456'
 * handleAmountInput('00123.456') // '123.456'
 * handleAmountInput('0.1234567890123456789') // '0.123456789012345678'
 * handleAmountInput('') // ''
 * handleAmountInput('.') // ''
 * handleAmountInput('.1') // '0.1'
 */
export const handleAmountInput = (value: string, maxDecimals = 18): string => {
  // Handle empty or dot-only input
  if (!value || value === '.') {
    return ''
  }

  // Validate input format: numbers with optional decimal point and up to maxDecimals decimal places
  const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`)
  if (!regex.test(value)) {
    return value.slice(0, -1) // Remove last character if invalid
  }

  // Remove leading zeros while preserving decimal numbers
  return value.replace(/^0+(?=\d)/, '')
}

/**
 * Formats a duration object to a human-readable label
 * @param duration - The duration object to format
 * @returns The formatted duration label
 * @example durationToLabel(Duration.fromObject({ days: 1, hours: 2, minutes: 30 })) // '1d 2h 30m'
 */
export const durationToLabel = (duration: Duration | undefined): string | undefined => {
  if (!duration) {
    return undefined
  }

  const converted = duration.shiftTo('days', 'hours', 'minutes')
  return `${converted.days}d ${converted.hours}h ${converted.minutes}m`
}

// prettier-ignore
export const formatAmount = (amount: string) => formatNumberWithCommas(formatEther(BigInt(amount)).split('.')[0])
