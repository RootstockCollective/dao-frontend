/**
 * Token storage utilities for managing JWT tokens in the frontend
 */

const TOKEN_STORAGE_KEY = 'auth-token'

/**
 * Stores the JWT token in localStorage
 */
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Retrieves the JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Removes the JWT token from localStorage
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Checks if a token exists
 */
export function hasToken(): boolean {
  return getToken() !== null
}
