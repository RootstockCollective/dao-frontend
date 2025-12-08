import { useAccount } from 'wagmi'

/**
 * Determines if the current wallet connection uses social login (Google, X, GitHub, Facebook etc.)
 * rather than a traditional crypto wallet (MetaMask, Rabby, Ledger, etc.)
 */
export function useIsSocialLogin(): boolean {
  const { connector } = useAccount()
  return connector?.type === 'AUTH' || connector?.id === 'ID_AUTH'
}
