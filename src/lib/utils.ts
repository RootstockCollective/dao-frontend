import { twMerge } from 'tailwind-merge'
import { clsx, ClassValue } from 'clsx'
import axios from 'axios'

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
  baseURL: process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES,
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

export const explorerURL = process.env.NEXT_PUBLIC_EXPLORER

export const isValidNumber = (value: string) => {
  // Regular expression to check if the input is a number with one allowed decimal
  const regex = /^\d*\.?\d{0,18}$/
  return regex.test(value)
}

export const goToExplorerWithTxHash = (hash: string) => window.open(`${explorerURL}/tx/${hash}`, '_blank')
