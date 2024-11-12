import { Meta, StoryObj } from '@storybook/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible'

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta

type Story = StoryObj<typeof meta>

export const CollapsiblePanel: Omit<Story, 'args'> = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>I am the header </CollapsibleTrigger>
      <CollapsibleContent>I am the body</CollapsibleContent>
    </Collapsible>
  ),
}
