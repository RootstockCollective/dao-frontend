import type { Meta, StoryObj } from '@storybook/react'
import { InfoContainer } from './InfoContainer'

const meta = {
  title: 'Koto/Container/InfoContainer',
  component: InfoContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InfoContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestid: 'test',
    children: (
      <>
        <h2 className="text-xl font-semibold">Information Title</h2>
        <p className="text-gray-600">
          This is some information content that would typically go inside the InfoContainer. It can contain
          multiple paragraphs and other elements.
        </p>
      </>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    dataTestid: 'test',
    className: 'bg-gray-100',
    children: (
      <>
        <h2 className="text-xl font-semibold">Information Title</h2>
        <p className="text-gray-600">
          This is some information content that would typically go inside the InfoContainer. It can contain
          multiple paragraphs and other elements.
        </p>
      </>
    ),
  },
}
