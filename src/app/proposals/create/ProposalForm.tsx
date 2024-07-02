'use client'
import { AccordionTrigger } from '@/components/Accordion'
import { TextInput } from '@/components/TextInput'
import { Header, Paragraph } from '@/components/Typography'
import { AccordionContent } from '@radix-ui/react-accordion'

export const ProposalForm = () => {
  const isCompleted = false
  return (
    <>
      <AccordionTrigger>
        <div className="flex justify-between inline-block align-middle w-full">
          <Header variant="h1" className="text-[24px]">
            Proposal
          </Header>
          {isCompleted && (
            <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <TextInput
          label="Proposal name"
          placeholder="name your proposal"
          onChange={() => {}}
          name="proposalName"
          fullWidth
          className="mb-6"
        />
      </AccordionContent>
    </>
  )
}
