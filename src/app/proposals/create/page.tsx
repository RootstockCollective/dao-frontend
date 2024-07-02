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
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const isProposalCompleted = proposalName && description
  const isActionsCompleted = toAddress && amount

  const handleProposalCompleted = () => {
    if (!isActionsCompleted) {
      setActiveStep('actions')
    } else {
      setActiveStep('')
    }
  }

  const handleActionsCompleted = () => {
    if (!isProposalCompleted) {
      setActiveStep('proposal')
    } else {
      setActiveStep('')
    }
  }

  return (
    <MainContainer>
      <HeaderSection disabled={!isProposalCompleted || !isActionsCompleted} />
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
              value={proposalName}
              onChange={setProposalName}
              name="proposalName"
              fullWidth
              className="mb-6 mx-1"
            />
            <Textarea
              label="Description"
              placeholder="Enter a description..."
              value={description}
              onChange={setDescription}
              name="description"
              fullWidth
              className="mb-6 mx-1"
            />
            <div className="flex justify-center mb-6">
              <Button disabled={!isProposalCompleted} onClick={handleProposalCompleted}>
                Save & Continue
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="actions">
          <AccordionTrigger>
            <div className="flex justify-between inline-block align-middle w-full">
              <Header variant="h1" className="text-[24px]">
                Actions
              </Header>
              {isActionsCompleted && (
                <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <TextInput
              label="Transfer to"
              placeholder="0x123...456"
              hint="Write or paste the wallet address of the recipient"
              value={toAddress}
              onChange={setToAddress}
              name="actionName"
              fullWidth
              className="mb-6 mx-1"
            />
            <TextInput
              label="Amount"
              placeholder="0.00"
              value={amount}
              onChange={setAmount}
              name="amount"
              fullWidth
              className="mb-6 mx-1"
            />
            <div className="flex justify-center mb-6">
              <Button disabled={!isActionsCompleted} onClick={handleActionsCompleted}>
                Save & Continue
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </MainContainer>
  )
}

const HeaderSection = ({ disabled = true }) => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold font-[18px]">
      Create proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button startIcon={<GoRocket />} disabled={disabled}>
        Publish
      </Button>
    </div>
  </div>
)
