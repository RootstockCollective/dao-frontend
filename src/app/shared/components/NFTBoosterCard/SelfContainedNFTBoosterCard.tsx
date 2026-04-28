import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { NFTBoosterCard } from '@/app/shared/components'

interface SelfContainedNFTBoosterCardPros {
  forceRender?: boolean
}
export const SelfContainedNFTBoosterCard = ({ forceRender = false }: SelfContainedNFTBoosterCardPros) => {
  const { userHasRewards, boostData } = useNFTBoosterContext()

  const { title, leftImageSrc } = communitiesMapByContract[boostData?.nftContractAddress ?? ''] ?? {}

  if (!boostData || !title || !forceRender) {
    return null
  }

  // FIXME: conversion to number seems silly. Either use bigint or number, not both.
  const boostValue = Number(boostData?.boostPercentage ?? 0)

  const content = userHasRewards
    ? `You're earning ${boostValue}% more rewards thanks to your ${title} NFT.`
    : `Voting ${title} Booster`

  return (
    <NFTBoosterCard boostValue={boostValue} nftThumbPath={leftImageSrc} title={title} content={content} />
  )
}
