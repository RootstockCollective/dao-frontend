import { Button } from '@/components/Button'
import {
  Form,
  FormControl,
  FormField,
  FormInputNumber,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/Form'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RocketIcon } from '@/components/Icons'
import { z } from 'zod'
import { percentageToWei } from '@/app/collective-rewards/settings/utils'
import { useBuilderSettingsContext } from './context'
import { Popover } from '@/components/Popover'

const formSchema = z.object({
  reward: z.string().transform(arg => arg.slice(0, arg.length - 1)),
})

export const BuilderRewardsSettingsForm: FC = () => {
  const router = useRouter()
  const [backButtonName, setBackButtonName] = useState('Cancel')
  const {
    current: { refetch, isLoading: isCurrentRewardsLoading },
    update: { isSuccess, setNewReward, isPending },
    isBuilderOperational,
  } = useBuilderSettingsContext()

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
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
                  <FormInputNumber
                    decimalScale={0}
                    placeholder="0 ... 100 %"
                    inputMode="numeric"
                    suffix="%"
                    max={100}
                    min={0}
                    {...field}
                    disabled={!isBuilderOperational}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="flex flex-row justify-start gap-4">
          <Popover
            content={
              <div className="text-[12px] font-bold mb-1">
                <p data-testid="adjustBackerRewardPctTooltip">
                  You need to be operational to adjust your backer reward %
                </p>
              </div>
            }
            size="small"
            position="top"
            trigger="hover"
            disabled={isBuilderOperational}
          >
            <Button
              startIcon={<RocketIcon />}
              disabled={!isDirty || !isValid || !isBuilderOperational}
              buttonProps={{ type: 'submit' }}
              loading={isPending}
            >
              Save changes
            </Button>
          </Popover>
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
