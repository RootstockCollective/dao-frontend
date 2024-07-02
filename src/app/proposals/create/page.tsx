'use client'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Header } from '@/components/Typography'
import { GoRocket } from 'react-icons/go'
import { ProposalForm } from './ProposalForm'
import { ActionsForm } from './ActionsForm'

export default function CreateProposal() {
  return (
    <MainContainer>
      <HeaderSection />
      <Accordion type="single" defaultValue="proposal" className="pl-4 container">
        <AccordionItem value="proposal">
          <ProposalForm />
        </AccordionItem>
        <AccordionItem value="action">
          <ActionsForm />
        </AccordionItem>
      </Accordion>
    </MainContainer>
  )
}

const HeaderSection = () => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold font-[18px]">
      Create proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button startIcon={<GoRocket />}>Publish</Button>
    </div>
  </div>
)
