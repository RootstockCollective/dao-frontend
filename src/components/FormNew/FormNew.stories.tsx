import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'
import { TextInput } from './TextInput'
import { TextArea } from './TextArea'
import { NumberInput } from './NumberInput'

const meta: Meta<typeof TextInput> = {
  title: 'Components/FormNew',
  component: TextInput,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const EmptyTextInput: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-full px-5 py-10">
        <TextInput label="Proposal name" value={value} onChange={e => setValue(e.target.value)} />
      </div>
    )
  },
}

export const TextInputWithInitialValue: Story = {
  render: () => {
    const [value, setValue] = useState('Bitdeploy didn՚t succeed in simplifying smart contracts')
    return (
      <div className="w-full px-5 py-10">
        <TextInput label="Proposal name" value={value} onChange={e => setValue(e.target.value)} />
      </div>
    )
  },
}

export const TextInputWithError: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const errMsg = (() => {
      if (value.length < 5) return 'Proposal name should be longer than 5 symbols'
      return ''
    })()
    return (
      <div className="w-full px-5 py-10">
        <TextInput
          errorMsg={errMsg}
          label="Proposal name"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    )
  },
}

export const EmptyTextarea: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-full px-5 py-10">
        <TextArea label="Short description" value={value} onChange={e => setValue(e.target.value)} />
      </div>
    )
  },
}

export const TextareaWithValue: Story = {
  render: () => {
    const [value, setValue] = useState(descriptionText)
    return (
      <div className="w-full px-5 py-10">
        <TextArea label="Short description" value={value} onChange={e => setValue(e.target.value)} />
      </div>
    )
  },
}

export const TextAreaWithError: Story = {
  render: () => {
    const [value, setValue] = useState(descriptionText)
    const errMsg = (() => {
      if (value.length > 100) return 'Description should be shorter than 100 symbols'
      return ''
    })()
    return (
      <div className="w-full px-5 py-10">
        <TextArea
          label="Short description"
          value={value}
          errorMsg={errMsg}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    )
  },
}

export const NumberInputWithValue: Story = {
  render: () => {
    const [value, setValue] = useState('1234567')
    return (
      <div className="w-full px-5 py-10">
        <NumberInput
          label="Amount to be transferred"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    )
  },
}

export const NumberInputWithError: Story = {
  render: () => {
    const [value, setValue] = useState('0')
    const errMsg = useMemo(() => {
      const num = parseInt(value)
      if (isNaN(num) || num < 100) return 'Number should be larger than 100'
      return ''
    }, [value])
    return (
      <div className="w-full px-5 py-10">
        <NumberInput
          label="Amount to be transferred"
          value={value}
          errorMsg={errMsg}
          onValueChange={val => setValue(val.value)}
        />
      </div>
    )
  },
}

export const MultipleFields: Story = {
  render: () => {
    const [name, setName] = useState('')
    const [link, setLink] = useState('')
    const [description, setDescription] = useState('')

    return (
      <div className="w-full px-5 py-10 space-y-4">
        <TextInput
          label="Address to transfer funds to"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <TextInput label="Discourse link" value={link} onChange={e => setLink(e.target.value)} />

        <TextArea
          label="Proposal description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
    )
  },
}

const descriptionText = `Lorem.
Lorem, ipsum.
Lorem, ipsum dolor.
Lorem ipsum dolor sit.
Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet consectetur.
Lorem ipsum dolor sit amet, consectetur adipisicing.
Lorem, ipsum dolor sit amet consectetur adipisicing elit.
Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere.
Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, ad!
Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus, cupiditate fugit.
Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat distinctio necessitatibus facere.
Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt veniam tempore eos dolores!`
