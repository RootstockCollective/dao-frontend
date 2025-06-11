import React from 'react'
import { Dropdown } from './Dropdown'

export default {
  title: 'DropdownV3/Dropdown',
  component: Dropdown,
}

export const Basic = () => (
  <Dropdown trigger={<button>Open Dropdown</button>}>
    <div style={{ padding: 16 }}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </div>
  </Dropdown>
)

export const WithRenderProp = () => (
  <Dropdown trigger={<button>Open Dropdown</button>}>
    {close => (
      <div style={{ padding: 16 }}>
        <div onClick={close}>Close me (Item 1)</div>
        <div>Item 2</div>
      </div>
    )}
  </Dropdown>
)
