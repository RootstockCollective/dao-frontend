import { Button } from '@/components/Button'
import { Form, FormControl, FormField, FormInput, FormItem, FormLabel, FormMessage } from '@/components/Form'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { z } from 'zod'
import { percentageToWei } from '../utils'
import { useBuilderSettingsContext } from './context'

const formSchema = z.object({
  reward: z
    .string()
    .regex(
      /^\d{1,3}(\.\d{1,18})?$/,
      'Invalid format: should only contain digits and at most 1 decimal point with up to 18 decimal places.',
    )
    .refine(
      value => {
        const digitsOnly = value.replace('.', '')

        if (digitsOnly.length > 19) {
          return false
        }

        const [whole, decimal] = value.split('.')

        // Check that if there are 3 digits before the decimal, they must be "100" and there are no non-zero digits after ".".
        return whole.length < 3 || (whole === '100' && (!decimal || BigInt(decimal) == 0n))
      },
      {
        message: 'Value must be between 0 and 100',
      },
    ),
})

export const BuilderRewardsSettingsForm: FC = () => {
  const router = useRouter()
  const [backButtonName, setBackButtonName] = useState('Cancel')
  const {
    current: { refetch, isLoading: isCurrentRewardsLoading },
    update: { isSuccess, setNewReward, isPending },
  } = useBuilderSettingsContext()

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      reward: '',
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = form

  useEffect(() => {
    if (isSuccess) {
      refetch()
      setBackButtonName('Go Back')
    }
  }, [isSuccess, refetch])

  const submitForm = ({ reward }: z.infer<typeof formSchema>) => {
    setNewReward(percentageToWei(reward))
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(submitForm)}>
        <FormField
          control={control}
          name="reward"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-4 space-y-0">
              <FormLabel className="font-rootstock-sans font-normal text-base leading-none p-0">
                Adjust backers rewards %
              </FormLabel>
              <FormControl className="bg-[#1A1A1A] rounded border border-[#2D2D2D] w-36 h-[53px] gap-2 items-center flex">
                {isCurrentRewardsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <FormInput placeholder="0 ... 100 %" inputMode="decimal" {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="flex flex-row justify-start gap-4">
          <Button
            startIcon={<GoRocket />}
            disabled={!isDirty || !isValid}
            buttonProps={{ type: 'submit' }}
            loading={isPending}
          >
            Save changes
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              router.back()
            }}
          >
            {backButtonName}
          </Button>
        </div>
      </form>
    </Form>
  )
}
