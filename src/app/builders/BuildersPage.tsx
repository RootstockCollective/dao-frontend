'use client'

import { useAccount } from 'wagmi'
import { ActionsContainer } from './components/Container'
import { ActionMetricsContainer } from './components/Container/ActionMetricsContainer'
import { InfoContainer } from './components/Container/InfoContainer'
import { MetricsContainer } from './components/Container/MetricsContainer'
import { PageTitleContainer } from './components/Container/PageTitleContainer'
import { Metrics } from './components/Metrics'
import { Content } from './components/Content'
import { Spotlight } from './components/Spotlight'
import { Table } from './components/Table'

const NAME = 'Builders'

export const BuildersPage = () => {
  const { address } = useAccount()

  const TableTitle = () => (
    <div className="flex items-center justify-between w-full">
      <h3 className="text-lg font-semibold text-white">THE COLLECTIVE BUILDERS</h3>
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Active Builders</span>
      </div>
    </div>
  )

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME} dataTestid={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      
      <div data-testid={`${NAME}_info`} className="flex flex-col w-full items-start gap-2">
        <InfoContainer dataTestid={NAME}>
          <Content />
        </InfoContainer>
        <MetricsContainer dataTestid={NAME}>
          <Metrics />
        </MetricsContainer>
      </div>

      {address && (
        <ActionMetricsContainer dataTestid={NAME}>
          <Spotlight />
        </ActionMetricsContainer>
      )}
      
      <ActionsContainer title={<TableTitle />} dataTestid={NAME}>
        <Table />
      </ActionsContainer>
    </div>
  )
}