'use client'
import { Address } from 'viem'
import { useEffect, useState } from 'react'
import { NFTWalletLocalStorage } from './types'
import { Eip1193Provider } from 'ethers'

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

export const useCurrentUserNFTInWallet = () => {
  const [isNFTInWalletLoading, setIsLoading] = useState(true)
  const [nftsInWallet, setNftsInWallet] = useState<NFTWalletLocalStorage>(getNFTInWalletLocalStorage())
  useEffect(() => {
    const data = getNFTInWalletLocalStorage()
    setNftsInWallet(data)
    setIsLoading(false)
  }, [])

  const onUpdateNftInWalletData = (nftAddress: Address, tokenId: number) => {
    setNftsInWallet(old => {
      const data = { ...old, [nftAddress]: { ...old[nftAddress as Address], [tokenId]: true } }
      updateNFTInWalletLocalStorage(data)
      return data
    })
  }

  return {
    isNFTInWalletLoading,
    nftsInWallet,
    onUpdateNftInWalletData,
  }
}

interface AddToWalletArgument {
  nftAddress: string
  nftSymbol: string
  image: string
  tokenId: string
}

export const requestProviderToAddNFT: (arg: AddToWalletArgument) => Promise<unknown> = ({
  nftAddress,
  nftSymbol,
  image,
  tokenId,
}) =>
  (window.ethereum as unknown as Eip1193Provider).request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC721',
      options: {
        address: nftAddress,
        symbol: nftSymbol,
        image: image,
        tokenId: String(tokenId),
      },
    },
  })
