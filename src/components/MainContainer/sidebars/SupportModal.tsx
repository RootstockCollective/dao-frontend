'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RefreshCw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/Button'
import { TextArea, TextInput } from '@/components/FormFields'
import { Modal } from '@/components/Modal'
import { Header, Paragraph } from '@/components/Typography'

interface CaptchaChallenge {
  a: number
  b: number
  answer: number
}

const generateChallenge = (): CaptchaChallenge => {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, answer: a + b }
}

const emptyString = z.literal('').transform(() => {})

const buildSupportSchema = (challenge: CaptchaChallenge) =>
  z.object({
    email: z.union([emptyString, z.string().trim().email('Please enter a valid email')]).optional(),
    description: z
      .string()
      .trim()
      .min(10, 'Please provide at least 10 characters')
      .max(1000, 'Description must be under 1000 characters'),
    captcha: z
      .string()
      .trim()
      .min(1, 'Please solve the captcha')
      .refine(value => Number(value) === challenge.answer, 'Incorrect answer, please try again'),
  })

interface SupportFormValues {
  description: string
  captcha: string
  email?: string
}

interface SupportModalProps {
  onClose: () => void
}

export const SupportModal = ({ onClose }: SupportModalProps) => {
  const [challenge, setChallenge] = useState<CaptchaChallenge>(() => generateChallenge())

  const schema = useMemo(() => buildSupportSchema(challenge), [challenge])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', description: '', captcha: '' },
    mode: 'onSubmit',
  })

  const refreshCaptcha = useCallback(() => {
    setChallenge(generateChallenge())
    reset(values => ({ ...values, captcha: '' }))
  }, [reset])

  const onSubmit = handleSubmit(async _values => {
    // TODO: wire up backend ticket submission.
    onClose()
  })

  return (
    <Modal onClose={onClose} width={520} data-testid="SupportModal">
      <form onSubmit={onSubmit} className="flex flex-col p-4 md:p-6">
        <Header variant="h2" className="mt-10 mb-2">
          CONTACT SUPPORT
        </Header>
        <Paragraph variant="body-s" className="text-text-60 mb-6">
          Tell us what you need help with. Leave an email if you would like a reply.
        </Paragraph>

        <div className="flex flex-col gap-4">
          <TextInput name="email" control={control} label="Email (optional)" data-testid="SupportEmail" />
          <TextArea
            name="description"
            control={control}
            label="How can we help?"
            minRows={5}
            maxRows={10}
            data-testid="SupportDescription"
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div
                className="flex-1 bg-bg-60 rounded-sm px-4 py-3 select-none font-rootstock-sans text-text-100"
                data-testid="SupportCaptchaQuestion"
              >
                What is{' '}
                <span className="font-bold">
                  {challenge.a} + {challenge.b}
                </span>
                ?
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="p-2 rounded-sm border border-bg-0 text-text-100 hover:bg-bg-60"
                aria-label="Refresh captcha"
                data-testid="SupportCaptchaRefresh"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <TextInput
              name="captcha"
              control={control}
              label="Your answer"
              inputMode="numeric"
              data-testid="SupportCaptchaAnswer"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse md:flex-row gap-3 md:justify-end">
          <Button type="button" variant="secondary-outline" onClick={onClose} data-testid="SupportCancel">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} data-testid="SupportSend">
            Send
          </Button>
        </div>
      </form>
    </Modal>
  )
}
