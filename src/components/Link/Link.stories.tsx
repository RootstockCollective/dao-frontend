import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './Link'

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
export const DefaultInText: Story = {
  render: () => (
    <p>
      This is a <Link>default Link</Link> inside a paragraph of text.
    </p>
  ),
}
export const MenuInList: Story = {
  render: () => (
    <ul>
      <li>
        <Link variant="menu">Register RNS Domain</Link>
      </li>
      <li>
        <Link variant="menu">Token Bridge Dapp</Link>
      </li>
    </ul>
  ),
}
