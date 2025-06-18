import {
  ActionMetricsContainer,
  ActionsContainer,
  InfoContainer,
  MetricsContainer,
  PageTitleContainer,
} from '@/components/containers'
import { BuildersTable } from './components/BuildersTable'
import { Content } from './components/Content'
import { Metrics } from './components/Metrics'
import { Spotlight } from './components/Spotlight'

const NAME = 'Builders'

export const BuildersPage = () => {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-6 rounded-sm">
      <PageTitleContainer leftText={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>

      <div data-testid="info" className="flex flex-col w-full items-start gap-2">
        <MetricsContainer>
          <Metrics />
        </MetricsContainer>
        <InfoContainer className="grow-[3]">
          <Content />
        </InfoContainer>
        <ActionMetricsContainer>
          <Spotlight />
        </ActionMetricsContainer>
        <ActionsContainer title={'The Collective Builders'}>
          <BuildersTable />
        </ActionsContainer>
      </div>
    </div>
  )
}
