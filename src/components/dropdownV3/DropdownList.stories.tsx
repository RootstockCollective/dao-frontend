import React from 'react'
import { DropdownList } from './DropdownList'

export default {
  title: 'DropdownV3/DropdownList',
  component: DropdownList,
}

const items = ['Apple', 'Banana', 'Cherry']

export const Basic = () => (
  <DropdownList
    items={items}
    renderItem={(item, idx, active) => (
      <div style={{ background: active ? '#eee' : 'white', padding: 8 }}>{item}</div>
    )}
  />
)
