'use client'
import { requestProviderToAddNFT, useCurrentUserNFTInWallet } from '../utilsClient'
import { Button } from '@/components/ButtonNew'
import { Address } from 'viem'
import { useState } from 'react'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { nftAlertMessages } from '@/app/communities/nft/[address]/constants'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { showToast } from '@/shared/notification/toastUtils'

/**
 * Component that encapsulates the logic of the add to wallet
 * User MUST be connected
 * @constructor
 */
export const AddToWalletButton = () => {
  const { tokenId = 0, nftAddress, nftSymbol, image } = useCommunityNFT()
  const { nftsInWallet, isNFTInWalletLoading, onUpdateNftInWalletData } = useCurrentUserNFTInWallet()
  const [isAdding, setIsAdding] = useState(false)

  const userHasWalletInstalled = !!window.ethereum

  const didUserAlreadyAddNftToWallet = nftsInWallet?.[nftAddress as Address]?.[tokenId] || false

  const onAddToWallet = async (retryCount = 0) => {
    try {
      setIsAdding(true)
      await requestProviderToAddNFT({
        nftAddress,
        nftSymbol: nftSymbol || '',
        tokenId: tokenId.toString(),
        image,
      })
      // We assume it was successful from now
      showToast(nftAlertMessages.ADDED_SUCCESSFULLY(tokenId))
      // Update the local storage
      onUpdateNftInWalletData(nftAddress as Address, tokenId)
    } catch (error) {
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
  }

  if (!userHasWalletInstalled || didUserAlreadyAddNftToWallet || !nftAddress || !tokenId || !nftSymbol) {
    return null
  }

  const isLoading = isNFTInWalletLoading || isAdding

  return (
    <Button onClick={() => onAddToWallet()} className="mb-4" disabled={isLoading}>
      Add to wallet
    </Button>
  )
}
