import type { Meta, StoryObj } from '@storybook/nextjs'
import { Link } from './Link'
import { Paragraph } from '../Typography'

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
    <Paragraph>
      This is a <Link href="/home">Link with modified font size</Link> inside a paragraph of Typography text.
    </Paragraph>
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
          <Paragraph>Register RNS Domain</Paragraph>
        </Link>
      </li>
      <li>
        <Link variant="menu" href="/home">
          <Paragraph>Token Bridge dApp</Paragraph>
        </Link>
      </li>
    </ul>
  ),
}
