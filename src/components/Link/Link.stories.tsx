import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './Link'

import { userEvent, within, expect, spyOn } from '@storybook/test'

const meta = {
  title: 'Components/Link',
  component: Link,
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    children: <p>Grant Bonus wave 6</p>,
  },
}
export const Menu: Story = {
  args: {
    variant: 'menu',
    children: <p>Register RNS Domain</p>,
  },
}
