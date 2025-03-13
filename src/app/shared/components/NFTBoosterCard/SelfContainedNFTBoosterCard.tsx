import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { NFTBoosterCard } from '@/app/shared/components'
import { usePathname } from 'next/navigation'
import { FC } from 'react'

const visibleRoutes = ['/collective-rewards', '/']

type SelfContainedNFTBoosterCardPros = {
  forceRender?: boolean
}
export const SelfContainedNFTBoosterCard: FC<SelfContainedNFTBoosterCardPros> = ({ forceRender = false }) => {
  const { isBoosted, userHasRewards, boostData } = useNFTBoosterContext()
  const pathname = usePathname()

  const { title, leftImageSrc } = communitiesMapByContract[boostData?.nftContractAddress ?? ''] ?? {}

  if (!title || (!isBoosted && !forceRender) || !visibleRoutes.includes(pathname)) {
    return null
  }

  // FIXME: conversion to number seems silly. Either use bigint or number, not both.
  const boostValue = Number(boostData?.boostPercentage)

  const content = userHasRewards
    ? `You're earning ${boostValue}% more rewards thanks to your ${title} NFT.`
    : `Voting ${title} Booster`

  return (
    <NFTBoosterCard boostValue={boostValue} nftThumbPath={leftImageSrc} title={title} content={content} />
  )
}
