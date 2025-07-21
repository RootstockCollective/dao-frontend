import type { Meta, StoryObj } from '@storybook/react'
import { useForm, Control } from 'react-hook-form'
import { TextInput } from './TextInput'
import { TextArea } from './TextArea'
import { NumberInput } from './NumberInput'

// Form wrapper for stories
function FormWrapper({
  children,
  defaultValues = {},
}: {
  children: (props: { control: Control<any> }) => React.ReactElement
  defaultValues?: any
}) {
  const { control } = useForm({
    defaultValues,
    mode: 'onChange',
  })

  return (
    <form>
      <div className="w-full px-5 py-10 space-y-4">{children({ control })}</div>
    </form>
  )
}

const meta: Meta<typeof TextInput> = {
  title: 'Components/FormFields',
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
  render: () => (
    <FormWrapper>
      {({ control }) => <TextInput name="proposalName" control={control} label="Proposal name" />}
    </FormWrapper>
  ),
}

export const TextInputWithInitialValue: Story = {
  render: () => (
    <FormWrapper defaultValues={{ proposalName: 'Bitdeploy didn՚t succeed in simplifying smart contracts' }}>
      {({ control }) => <TextInput name="proposalName" control={control} label="Proposal name" />}
    </FormWrapper>
  ),
}

export const TextInputWithError: Story = {
  render: () => (
    <FormWrapper>
      {({ control }) => (
        <TextInput name="proposalName" control={control} label="Proposal name" minLength={5} />
      )}
    </FormWrapper>
  ),
}

export const EmptyTextarea: Story = {
  render: () => (
    <FormWrapper>
      {({ control }) => <TextArea name="description" control={control} label="Short description" />}
    </FormWrapper>
  ),
}

export const TextareaWithValue: Story = {
  render: () => (
    <FormWrapper defaultValues={{ description: descriptionText }}>
      {({ control }) => <TextArea name="description" control={control} label="Short description" />}
    </FormWrapper>
  ),
}

export const TextAreaWithError: Story = {
  render: () => (
    <FormWrapper defaultValues={{ description: descriptionText }}>
      {({ control }) => (
        <TextArea name="description" control={control} label="Short description" maxLength={100} />
      )}
    </FormWrapper>
  ),
}

export const NumberInputWithValue: Story = {
  render: () => (
    <FormWrapper defaultValues={{ amount: '1234567' }}>
      {({ control }) => <NumberInput name="amount" control={control} label="Amount to be transferred" />}
    </FormWrapper>
  ),
}

export const NumberInputWithError: Story = {
  render: () => (
    <FormWrapper defaultValues={{ amount: '0' }}>
      {({ control }) => (
        <NumberInput name="amount" control={control} label="Amount to be transferred" min={100} />
      )}
    </FormWrapper>
  ),
}

export const MultipleFields: Story = {
  render: () => (
    <FormWrapper
      defaultValues={{
        address: '',
        link: '',
        description: '',
      }}
    >
      {({ control }) => (
        <>
          <TextInput name="address" control={control} label="Address to transfer funds to" disabled />
          <TextInput name="link" control={control} label="Discourse link" disabled />
          <TextArea name="description" control={control} label="Proposal description" disabled />
        </>
      )}
    </FormWrapper>
  ),
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
