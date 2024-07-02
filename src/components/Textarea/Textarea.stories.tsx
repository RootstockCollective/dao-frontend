import { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '@/components/Textarea'
import { userEvent, within, expect } from '@storybook/test'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'test',
    name: 'test',
  },
}

export const WithLabel: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'Enter a description...',
    name: 'Description',
    label: 'Description',
    fullWidth: true,
  },
}

export const WithError: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'Enter a description...',
    name: 'Description',
    label: 'Description',
    fullWidth: true,
    errorMessage: 'This is an error message',
  },
}

export const UnControlledInputTest: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'Enter a description...',
    name: 'description',
    label: 'Description',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('description')

    await userEvent.type(input, 'Hello')
    await expect(input).toHaveValue('Hello')
  },
}

export const ControlledInputTest: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    placeholder: 'Enter a description...',
    name: 'description',
    label: 'Description',
    fullWidth: true,
    value: 'Start',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('description')

    await userEvent.type(input, 'Hello')
    await expect(input).toHaveValue('Start')
  },
}
