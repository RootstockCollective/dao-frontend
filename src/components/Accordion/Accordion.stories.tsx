import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
import { AccordionHeader } from '@radix-ui/react-accordion'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

const AccordionTemplate = () => (
  <>
    <AccordionItem value="item-1">
      <AccordionHeader>this is a header</AccordionHeader>
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Is it responsive?</AccordionTrigger>
      <AccordionContent>Yes. It is responsive by default.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Is it customizable?</AccordionTrigger>
      <AccordionContent>Yes. It is highly customizable.</AccordionContent>
    </AccordionItem>
  </>
)

export const SingleAndCollapsible: Omit<Story, 'args'> = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionTemplate />
    </Accordion>
  ),
}

export const SingleAndNonCollapsible: Omit<Story, 'args'> = {
  render: () => (
    <Accordion type="single">
      <AccordionTemplate />
    </Accordion>
  ),
}

export const Multiple: Omit<Story, 'args'> = {
  render: () => (
    <Accordion type="multiple">
      <AccordionTemplate />
    </Accordion>
  ),
}
