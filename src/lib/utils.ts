import axios from 'axios'
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { EXPLORER_URL, RIF_WALLET_SERVICES_URL } from './constants'

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
 * @example shortAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') // '0xf39F...92266'
 */
export const shortAddress = (address: string | undefined, amount = 5): string => {
  if (!address) {
    return ''
  }
  return `${address.slice(0, amount + 1)}...${address.slice(-amount)}`
}

export const axiosInstance = axios.create({
  baseURL: RIF_WALLET_SERVICES_URL,
})

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
  return str.slice(0, length) + '...'
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
  return str.slice(0, start) + '...' + str.slice(-end)
}

export const isValidNumber = (value: string) => {
  // Regular expression to check if the input is a number with one allowed decimal
  const regex = /^\d*\.?\d{0,18}$/
  return regex.test(value)
}

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
 * @example formatCurrency(0.0001) // '<$0.00'
 * @example formatCurrency(0) // '$0.00'
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  if (0 < value && value < 0.01) {
    return '<$0.01'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats avoiding scientific notation
 * @param n - The number to format
 * @returns The formatted number
 * @example toFixed(1e-7) // '0.0000001'
 * @example toFixed(1.123456789e-7) // '0.0000001123456789'
 * @example toFixed(1.1e+10) // '11000000000'
 * @example toFixed(1.1e20) // '110000000000000000000'
 */
export const toFixed = (n: number) => {
  if (Math.abs(n) < 1.0) {
    const e = parseInt(n.toString().split('e-')[1])
    if (e) {
      return Number(n).toFixed(e)
    }
  } else {
    let e = parseInt(n.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      n /= Math.pow(10, e)
      return n + new Array(e + 1).join('0')
    }
  }
  return n.toString()
}
