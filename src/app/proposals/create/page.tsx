import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Header } from '@/components/Typography'
import { GoRocket } from 'react-icons/go'

export default function CreateProposal() {
  return (
    <MainContainer>
      <HeaderSection />
    </MainContainer>
  )
}

const HeaderSection = () => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold">
      Create proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button startIcon={<GoRocket />}>Publish</Button>
    </div>
  </div>
)
