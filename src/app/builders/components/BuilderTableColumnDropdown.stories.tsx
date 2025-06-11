import React from 'react'
import { BuilderTableColumnDropdown } from './BuilderTableColumnDropdown'

export default {
  title: 'Builders/BuilderTableColumnDropdown',
  component: BuilderTableColumnDropdown,
}

export const Basic = () => (
  <BuilderTableColumnDropdown className="flex justify-end items-start p-10 min-h-[200px] w-[500px] relative" />
)
