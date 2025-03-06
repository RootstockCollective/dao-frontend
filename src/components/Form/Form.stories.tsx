import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { BitcoinIcon } from '../Icons'
import { Button } from '../Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form'
import { FormInput } from './FormInput'
import { FormTextarea } from './FormTextarea'

const meta = {
  title: 'Components/Form',
  component: Form,
} satisfies Meta<typeof Form>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Omit<Story, 'args'> = {
  render: () => {
    const form = useForm()
    const { control } = form
    return (
      <Form {...form}>
        <FormField
          name="Field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <FormInput placeholder="Name your proposal" {...field} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <FormTextarea placeholder="Enter a description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="toAddress"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Transfer to</FormLabel>
              <FormControl>
                <FormInput placeholder="0x123...456" {...field} />
              </FormControl>
              <FormDescription>Write or paste the wallet address of the recipient</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row">
          <FormField
            control={control}
            name="tokenSymbol"
            render={({ field }) => (
              <FormItem className="mb-6 mx-1">
                <FormLabel>Change Asset</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RBTC">
                        <div className="flex items-center">
                          {/* TODO: token icon */}
                          <BitcoinIcon className="mr-2" />
                          RBTC
                        </div>
                      </SelectItem>
                      <SelectItem value="stRIF">
                        <div className="flex items-center">
                          <BitcoinIcon className="mr-2" />
                          stRIF
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem className="mb-6 mx-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <FormInput placeholder="0.00" type="number" className="w-64" {...field} />
                </FormControl>
                <FormDescription>= $ USD 0.00</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button>Submit</Button>
      </Form>
    )
  },
}
