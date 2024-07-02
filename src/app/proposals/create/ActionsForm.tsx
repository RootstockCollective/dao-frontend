'use client'
import { AccordionTrigger } from '@/components/Accordion'
import { Header, Paragraph } from '@/components/Typography'
import { AccordionContent } from '@radix-ui/react-accordion'

export const ActionsForm = () => {
  const isCompleted = false
  return (
    <>
      <AccordionTrigger>
        <div className="flex justify-between inline-block align-middle w-full">
          <Header variant="h1" className="text-[24px]">
            Actions
          </Header>
          {isCompleted && (
            <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent></AccordionContent>
    </>
  )
}
