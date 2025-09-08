import { Meta, StoryObj } from '@storybook/nextjs'
import { MINIMAL_VIEWPORTS } from 'storybook/viewport'
import { TableMD } from './TableMD'

const meta: Meta<typeof TableMD> = {
  title: 'MyRewards/TableMD',
  component: TableMD,
  parameters: {
    layout: 'centered',
    viewport: {
      options: MINIMAL_VIEWPORTS,
    },
    globals: {
      viewport: {
        value: 'mobile1',
        isRotated: false,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TableMD>

export const Template: Story = {
  render: (args: any) => <TableMD {...args} />,
}
