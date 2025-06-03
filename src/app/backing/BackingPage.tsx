'use client'

import { useAccount } from 'wagmi'
import { ActionsContainer } from '../shared/components/Container'
import { ActionMetricsContainer } from '../shared/components/Container/ActionMetricsContainer'
import { InfoContainer } from '../shared/components/Container/InfoContainer'
import { MetricsContainer } from '../shared/components/Container/MetricsContainer'
import { PageTitleContainer } from '../shared/components/Container/PageTitleContainer'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      <div data-testid="CenterContainer" className="flex w-full items-start gap-2">
        <InfoContainer className="grow-[9]">{/* TODO: ADD CHILDREN HERE */}</InfoContainer>
        <MetricsContainer className="grow-[3]">{/* TODO: ADD CHILDREN HERE */}</MetricsContainer>
      </div>

      {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}</ActionMetricsContainer>}
      <ActionsContainer title="TODO: ADD TITLE COMPONENT" />
    </div>
  )
}
