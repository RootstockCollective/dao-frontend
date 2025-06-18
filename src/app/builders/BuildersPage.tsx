import {
  ActionMetricsContainer,
  ActionsContainer,
  InfoContainer,
  MetricsContainer,
} from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { Content } from './components/Content'
import { Metrics } from './components/Metrics'
import { Spotlight } from './components/Spotlight'
import BuildersTable from './components/Table/BuildersTable'

const NAME = 'Builders'
export const BuildersPage = () => {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-6 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>

      <div data-testid="info" className="flex flex-col w-full items-start gap-2">
        <MetricsContainer className="bg-v3-bg-accent-80">
          <Metrics />
        </MetricsContainer>
        <InfoContainer className="grow-[3] bg-v3-bg-accent-80">
          <Content />
        </InfoContainer>
        <ActionMetricsContainer className="bg-v3-bg-accent-80">
          <Spotlight />
        </ActionMetricsContainer>
        <ActionsContainer title={'The Collective Builders'} className="bg-v3-bg-accent-80">
          <BuildersTable />
        </ActionsContainer>
      </div>
    </div>
  )
}
