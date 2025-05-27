'use client'

import { useAccount } from 'wagmi'
import { ActionsContainer } from './components/Container'
import { ActionMetricsContainer } from './components/Container/ActionMetricsContainer'
import { InfoContainer } from './components/Container/InfoContainer'
import { MetricsContainer } from './components/Container/MetricsContainer'
import { PageTitleContainer } from './components/Container/PageTitleContainer'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME} dataTestid={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      <div data-testid={`${NAME}_info`} className="flex w-full items-start gap-2">
        <InfoContainer dataTestid={NAME}>{/* TODO: ADD CHILDREN HERE */}</InfoContainer>
        <MetricsContainer dataTestid={NAME}>{/* TODO: ADD CHILDREN HERE */}</MetricsContainer>
      </div>

      {address && (
        <ActionMetricsContainer dataTestid={NAME}>{/* TODO: ADD CHILDREN HERE */}</ActionMetricsContainer>
      )}
      <ActionsContainer title={`TODO: ADD TITLE COMPONENT`} dataTestid={NAME} />
    </div>
  )
}
