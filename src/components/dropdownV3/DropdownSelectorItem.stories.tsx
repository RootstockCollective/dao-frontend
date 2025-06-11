import React from 'react'
import { DropdownSelectorItem } from './DropdownSelectorItem'

export default {
  title: 'DropdownV3/DropdownSelectorItem',
  component: DropdownSelectorItem,
}

export const Basic = () => {
  return (
    <div className="p-4">
      <DropdownSelectorItem label="Basic Item" checked={false} />
    </div>
  )
}

export const Checked = () => {
  return (
    <div className="p-4">
      <DropdownSelectorItem label="Checked Item" checked={true} />
    </div>
  )
}

export const WithSublabel = () => {
  return (
    <div className="p-4">
      <DropdownSelectorItem label="Item with Sublabel" sublabel="Additional info" checked={false} />
    </div>
  )
}

export const CheckedWithSublabel = () => {
  return (
    <div className="p-4">
      <DropdownSelectorItem label="Checked Item with Sublabel" sublabel="Additional info" checked={true} />
    </div>
  )
}
