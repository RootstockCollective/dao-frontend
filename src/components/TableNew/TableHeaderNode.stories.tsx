import type { Meta, StoryObj } from '@storybook/react'
import { Header } from '../TypographyNew'
import { TableHeaderNode, TableHeaderNodeProps } from './TableHeaderNode'

const meta: Meta<typeof TableHeaderNode> = {
  title: 'Components/TableNew/TableHeaderNode',
  component: TableHeaderNode,
  tags: ['autodocs'],
}

const Wrap = (props: TableHeaderNodeProps) => (
  <TableHeaderNode {...props}>
    <Header variant="h1">Some title</Header>
    <Header variant="h2">And a subtitle</Header>
  </TableHeaderNode>
)

export default meta

type Story = StoryObj<typeof TableHeaderNode>

export const Default: Story = {
  render: () => (
    <>
      <Wrap />
    </>
  ),
}

export const TextOnly: Story = {
  render: _ => (
    <>
      <TableHeaderNode>
        Some title text
        <br />
        And some subtext
      </TableHeaderNode>
    </>
  ),
}

export const TextOnlyWithCustomStyle: Story = {
  render: () => (
    <>
      <Wrap className="bg-green-800" />
    </>
  ),
}

export const InsideFramedContainer: Story = {
  render: () => (
    <div className="flex w-[300px] bg-red-200">
      <Wrap />
    </div>
  ),
}

export const InheritingStyle: Story = {
  render: () => (
    <div className="flex bg-red-200 text-green-800">
      <Wrap />
    </div>
  ),
}
