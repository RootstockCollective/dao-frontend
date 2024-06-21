import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './Link'
import { Typography } from '../Typography'

const meta = {
  title: 'Components/Link',
  component: Link,
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    href: '/bonus',
    target: '_blank',
    children: <p>Grant Bonus wave 6</p>,
  },
}
export const Menu: Story = {
  args: {
    variant: 'menu',
    href: 'http://rootstock.io',
    target: '_blank',
    children: <p>Register RNS Domain</p>,
  },
}

export const DefaultInText: Story = {
  args: {
    href: '/home',
  },
  render: () => (
    <Typography tagVariant="p">
      This is a{' '}
      <Link className="text-[1rem]" href="/home">
        Link with modified font size
      </Link>{' '}
      inside a paragraph of Typography text.
    </Typography>
  ),
}
export const MenuInList: Story = {
  args: {
    href: '/home',
  },
  render: () => (
    <ul>
      <li>
        <Link variant="menu" href="/home">
          <Typography tagVariant="p">Register RNS Domain</Typography>
        </Link>
      </li>
      <li>
        <Link variant="menu" href="/home">
          <Typography tagVariant="p">Token Bridge Dapp</Typography>
        </Link>
      </li>
    </ul>
  ),
}

