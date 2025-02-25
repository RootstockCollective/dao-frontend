import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { NFTBoosterCard } from '@/app/shared/components'
import { FC } from 'react'
import { communitiesMapByContract } from '@/app/communities/communityUtils'

type SelfContainedNFTBoosterCardPros = {
  forceRender?: boolean
}
export const SelfContainedNFTBoosterCard: FC<SelfContainedNFTBoosterCardPros> = ({ forceRender = false }) => {
  const { hasActiveCampaign, isBoosted, boostData } = useNFTBoosterContext()
  const { title } = communitiesMapByContract[boostData?.nftContractAddress ?? ''] ?? {}

  if (!title || !hasActiveCampaign || (!isBoosted && !forceRender)) {
    return null
  }

  // FIXME: conversion to number seems silly. Either use bigint or number, not both.
  const boostValue = Number(boostData?.boostPercentage)

  const content = isBoosted
    ? `You're earning ${boostValue}% more rewards thanks to your ${title} NFT.`
    : `Voting ${title} Booster`

  return <NFTBoosterCard boostValue={boostValue} nftThumbPath="" title={title} content={content} />
}
