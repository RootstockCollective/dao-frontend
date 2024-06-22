import { Meta, StoryObj } from '@storybook/react'
import { FormSection } from '@/components/FormSection/FormSection'
import { userEvent, within, expect } from '@storybook/test'

const meta = {
  title: 'Components/FormSection',
  component: FormSection
} satisfies Meta<typeof FormSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    header: 'Proposal',
    content: <p>test</p>
  }
}

export const ExpandedByDefault: Story = {
  args: {
    header: 'Expanded by Default',
    isExpanded: true,
    content: <p>Expanded</p>
  }
} 
export const NotExpandedByDefault: Story = {
  args: {
    header: 'Not Expanded by Default',
    content: <p>Not Expanded</p>
  }
} 

export const ExpandsTest: Story = {
  args: {
    header: 'Not Expanded by Default',
    content: <p>This just expanded!</p>
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const expand = canvas.getByTestId('ExpandIcon')
    await userEvent.click(expand)
    
    const content = canvas.getByText('This just expanded!')
    
    await expect(content).toBeInTheDocument()
  }
}

export const ExpandsAndCollapseTest: Story = {
  args: {
    header: 'ExpandsAndCollapseTest',
    content: <p>This just expanded!</p>
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const expand = canvas.getByTestId('ExpandIcon')
    await userEvent.click(expand)

    const content = canvas.getByText('This just expanded!')

    await expect(content).toBeInTheDocument()

    await userEvent.click(expand)

    await expect(content).not.toBeInTheDocument()
  }
} 
