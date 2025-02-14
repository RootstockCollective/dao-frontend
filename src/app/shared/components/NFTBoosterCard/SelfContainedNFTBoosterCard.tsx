import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { NFTBoosterCard } from '@/app/shared/components'
import { FC } from 'react'
import { communitiesMapByContract } from '../../../communities/communityUtils'

export const SelfContainedNFTBoosterCard: FC = () => {
  const { hasActiveCampaign, currentBoost, boostData } = useNFTBoosterContext()
  const { title } = communitiesMapByContract[boostData?.nftContractAddress ?? ''] ?? {}

  return (
    hasActiveCampaign &&
    currentBoost !== undefined &&
    title !== undefined &&
    boostData !== undefined && (
      // FIXME: conversion to number seems silly. Either use bigint or number, not both.
      <NFTBoosterCard boostValue={Number(boostData.boostPercentage)} nftThumbPath="" title={title} />
    )
  )
}
