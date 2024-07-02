'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TextInput } from '@/components/TextInput'
import { Textarea } from '@/components/Textarea'
import { Header, Paragraph } from '@/components/Typography'
import { useState } from 'react'
import { GoRocket } from 'react-icons/go'

export default function CreateProposal() {
  const [activeStep, setActiveStep] = useState('proposal')
  const [proposalName, setProposalName] = useState('')
  const [description, setDescription] = useState('')

  const isProposalCompleted = proposalName && description
  const isActionCompleted = false

  const handleContinue = () => setActiveStep('action')

  return (
    <MainContainer>
      <HeaderSection />
      <Accordion
        type="single"
        collapsible
        value={activeStep}
        onValueChange={setActiveStep}
        className="pl-4 container"
      >
        <AccordionItem value="proposal">
          <AccordionTrigger>
            <div className="flex justify-between inline-block align-middle w-full">
              <Header variant="h1" className="text-[24px]">
                Proposal
              </Header>
              {isProposalCompleted && (
                <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <TextInput
              label="Proposal name"
              placeholder="name your proposal"
              onChange={setProposalName}
              name="proposalName"
              fullWidth
              className="mb-6 mx-1"
            />
            <Textarea
              label="Description"
              placeholder="Enter a description..."
              onChange={setDescription}
              name="description"
              fullWidth
              className="mb-6 mx-1"
            />
            <div className="flex justify-center mb-6">
              <Button variant={isProposalCompleted ? 'primary' : 'disabled'} onClick={handleContinue}>
                Save & Continue
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="action">
          <AccordionTrigger>
            <div className="flex justify-between inline-block align-middle w-full">
              <Header variant="h1" className="text-[24px]">
                Actions
              </Header>
              {isActionCompleted && (
                <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent></AccordionContent>
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
