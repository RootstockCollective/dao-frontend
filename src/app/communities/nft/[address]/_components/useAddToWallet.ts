'use client'

import { useCurrentUserNFTInWallet } from '../utilsClient'
import type { Address } from 'viem'
import { useCallback, useMemo, useState } from 'react'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { nftAlertMessages } from '@/app/communities/nft/[address]/constants'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { showToast } from '@/shared/notification/toastUtils'
import { requestProviderToAddToken } from '@/shared/utils'
import { useAccount } from 'wagmi'

/**
 * Component that encapsulates the logic of the add to wallet
 * User MUST be connected
 * @constructor
 */
export function useAddToWallet() {
  const { tokenId = 0, nftAddress, nftSymbol, image } = useCommunityNFT()
  const { nftsInWallet, isNFTInWalletLoading, onUpdateNftInWalletData } = useCurrentUserNFTInWallet()
  const { isConnected, connector } = useAccount()
  const [isAdding, setIsAdding] = useState(false)

  // Check if the connected wallet is MetaMask - wallet_watchAsset only works with MetaMask
  // MetaMask can be identified by:
  // - connector.id: 'io.metamask', 'metaMaskSDK', 'injected' (when MetaMask is the injected provider)
  // - connector.name: contains 'MetaMask' or 'metamask'
  // - window.ethereum.isMetaMask: true (if available)
  
  const didUserAlreadyAddNftToWallet = nftsInWallet?.[nftAddress as Address]?.[tokenId] || false

  // Check window.ethereum
  const hasWindowEthereum = typeof window !== 'undefined' && !!window.ethereum
  const isWindowEthereumMetaMask = hasWindowEthereum && (window.ethereum as any).isMetaMask === true

  const isMetaMask =
    connector?.id === 'io.metamask' ||
    connector?.id === 'metaMaskSDK' ||
    connector?.id === 'injected' ||
    connector?.name?.toLowerCase().includes('metamask') ||
    isWindowEthereumMetaMask ||
    false

  const onAddToWallet = useCallback(
    async (retryCount = 0) => {
      try {
        setIsAdding(true)
        // wallet_watchAsset only works with MetaMask desktop, so use requestProviderToAddToken
        // which checks for window.ethereum
        await requestProviderToAddToken({
          address: nftAddress,
          symbol: nftSymbol || '',
          tokenId: tokenId.toString(),
          image,
          tokenType: 'ERC721',
        })
        // We assume it was successful from now
        showToast(nftAlertMessages.ADDED_SUCCESSFULLY(tokenId))
        // Update the local storage
        onUpdateNftInWalletData(nftAddress as Address, tokenId)
      } catch (error) {
        // Handle MetaMask not available error
        if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string' &&
          (error.message.includes('MetaMask is not installed') ||
            error.message.includes('not detected') ||
            error.message.includes('not available'))
        ) {
          showToast(
            nftAlertMessages.ERROR_GENERIC(
              tokenId,
              'MetaMask is required to add NFTs to your wallet. Please install MetaMask and refresh the page.',
            ),
          )
          return
        }

        if ((error as { message?: string })?.message?.includes('Unable to verify ownership')) {
          // Calling the function again after a short timeout if specific error was thrown.
          // This is done because the NFT is not recognized by the wallet within the first few seconds after minting
          if (retryCount < 3 /* @TODO 3 retries max? */) {
            await new Promise(res => setTimeout(res, 3000))
            return onAddToWallet(retryCount + 1) // Retry after 3s?
          } else {
            showToast(nftAlertMessages.ERROR_ON_OWNERSHIP())
          }
        }
        if (isUserRejectedTxError(error)) {
          showToast(nftAlertMessages.ERROR_ON_TX_REJECTED(tokenId || 0))
        }
        if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ) {
          let errorToSend = `Unexpected error: ${error.message}`
          if (error.message.includes('spam')) {
            errorToSend = 'Please try again in a bit (too many requests in a short time).'
          }
          showToast(nftAlertMessages.ERROR_GENERIC(tokenId, errorToSend))
        }
      } finally {
        setIsAdding(false)
      }
    },
    [image, nftAddress, nftSymbol, onUpdateNftInWalletData, tokenId],
  )

  // Hide button if:
  // 1. Connector is not MetaMask OR window.ethereum is not available (wallet_watchAsset only works with MetaMask browser extension)
  // 2. User already added NFT to wallet
  // 3. Required values are missing
  const isHidden =
    !isMetaMask ||
    !isWindowEthereumMetaMask || // Ensure window.ethereum is available (browser extension only)
    didUserAlreadyAddNftToWallet ||
    !nftAddress ||
    tokenId === undefined ||
    !nftSymbol

  const isLoading = isNFTInWalletLoading || isAdding

  return useMemo(
    () => ({
      isLoading,
      onAddToWallet,
      isHidden,
    }),
    [isLoading, onAddToWallet, isHidden],
  )
}
