'use client'

import { useAccount } from 'wagmi'
import { Typography } from '@/components/TypographyNew/Typography'
import { ActionsContainer } from '../shared/components/Container'
import { ActionMetricsContainer } from '../shared/components/Container/ActionMetricsContainer'
import { InfoContainer } from '../shared/components/Container/InfoContainer'
import { MetricsContainer } from '../shared/components/Container/MetricsContainer'
import { PageTitleContainer } from '../shared/components/Container/PageTitleContainer'
import { Metrics } from './components/Metrics'
import { Content } from './components/Content'
import { Spotlight } from './components/Spotlight'
import { Table } from './components/Table'

const NAME = 'Builders'

export const BuildersPage = () => {
  const { address } = useAccount()

  const TableTitle = () => (
    <div className="flex items-center justify-between w-full">
      <Typography variant="h3" className="text-lg font-semibold text-white uppercase">
        The Collective Builders
      </Typography>
      <div className="flex items-center space-x-2">
        <Typography variant="body" className="text-gray-400">
          Active Builders
        </Typography>
      </div>
    </div>
  )

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-6 rounded-sm">
      <PageTitleContainer leftText={NAME} data-testid={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>

      <div data-testid={`${NAME}_info`} className="flex flex-col w-full items-start gap-2">
        <MetricsContainer data-testid={NAME}>
          <Metrics />
        </MetricsContainer>
        <InfoContainer data-testid={NAME}>
          <Content />
        </InfoContainer>
      </div>

      {address && (
        <ActionMetricsContainer data-testid={NAME}>
          <Spotlight />
        </ActionMetricsContainer>
      )}

      <ActionsContainer title={<TableTitle />} data-testid={NAME}>
        <Table />
      </ActionsContainer>
    </div>
  )
}
