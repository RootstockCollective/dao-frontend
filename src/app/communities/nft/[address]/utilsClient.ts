'use client'
import { Address } from 'viem'
import { useEffect, useState } from 'react'
import { NFTWalletLocalStorage } from './types'

/***************************************************
 * Local Storage Logic to avoid adding wallet twice
 *************************************************/

/**
 * Type representing localStorage and state variable for tracking if an NFT token is added to the wallet
 * The structure of the variable is the following:
 * ```json
 * {
 *   "0x123456...123456": {
 *     1: true,
 *     2: true
 *   }
 * }
 * ```
 */

const NFT_LOCAL_STORAGE_KEY = 'isInWallet'

const getNFTInWalletLocalStorage = (): NFTWalletLocalStorage => {
  const storedValue = window.localStorage.getItem(NFT_LOCAL_STORAGE_KEY)
  return storedValue !== null ? JSON.parse(storedValue) : {}
}
/**
 * @param data
 */
const updateNFTInWalletLocalStorage = (data: NFTWalletLocalStorage) => {
  const stringified = JSON.stringify(data)
  localStorage.setItem(NFT_LOCAL_STORAGE_KEY, stringified)
  return data
}

// name of event emitted on adding NFT to wallet
const nftAddedToWalletEvent = 'nftAddedToWallet'
export const useCurrentUserNFTInWallet = () => {
  const [isNFTInWalletLoading, setIsLoading] = useState(true)
  const [nftsInWallet, setNftsInWallet] = useState<NFTWalletLocalStorage>(getNFTInWalletLocalStorage())

  useEffect(() => {
    const data = getNFTInWalletLocalStorage()
    setNftsInWallet(data)
    setIsLoading(false)

    // Listen for wallet updates from other components
    const handleWalletUpdate = () => {
      const updatedData = getNFTInWalletLocalStorage()
      setNftsInWallet(updatedData)
    }

    window.addEventListener(nftAddedToWalletEvent, handleWalletUpdate)
    return () => window.removeEventListener(nftAddedToWalletEvent, handleWalletUpdate)
  }, [])

  const onUpdateNftInWalletData = (nftAddress: Address, tokenId: number) => {
    setNftsInWallet(old => {
      const data = { ...old, [nftAddress]: { ...old[nftAddress as Address], [tokenId]: true } }
      updateNFTInWalletLocalStorage(data)
      // Dispatch custom event to sync between components
      window.dispatchEvent(
        new CustomEvent(nftAddedToWalletEvent, {
          detail: { nftAddress, tokenId },
        }),
      )
      return data
    })
  }

  return {
    isNFTInWalletLoading,
    nftsInWallet,
    onUpdateNftInWalletData,
  }
}
