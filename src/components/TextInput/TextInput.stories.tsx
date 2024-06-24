import { Meta, StoryObj } from '@storybook/react'
import { TextInput } from '@/components/TextInput/TextInput'
import { userEvent, within, expect } from '@storybook/test'

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
} satisfies Meta<typeof TextInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'test',
    name: 'test'
  }
}


export const WithLabel: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'name your proposal',
    name: 'Proposal name',
    label: 'Proposal name',
    fullWidth: true,
  }
}

export const WithError: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'name your proposal',
    name: 'Proposal name',
    label: 'Proposal name',
    fullWidth: true,
    errorMessage: 'This is an error message'
  }
}

export const UnControlledInputTest: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'name your proposal',
    name: 'proposal',
    label: 'Proposal name',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('proposal')

    await userEvent.type(input, 'Hello')
    await expect(input).toHaveValue('Hello')
  }
}

export const ControlledInputTest: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'name your proposal',
    name: 'proposal',
    label: 'Proposal name',
    fullWidth: true,
    value: 'Start',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('proposal')

    await userEvent.type(input, 'Hello')
    await expect(input).toHaveValue('Start')
  }
}
