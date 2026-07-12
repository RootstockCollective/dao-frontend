'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useCallback, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/Button'
import { TextArea, TextInput } from '@/components/FormFields'
import { ErrorMessage } from '@/components/FormFields/ErrorMessage'
import { Modal } from '@/components/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { showToast } from '@/shared/notification'

// Cloudflare-published test key that always passes. Safe as a public default;
// production builds must set NEXT_PUBLIC_TURNSTILE_SITE_KEY to a real siteKey.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY

const emptyString = z.literal('').transform(() => {})

const supportSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters')
    .max(1000, 'Description must be under 1000 characters'),
  turnstileToken: z.string().min(1, 'Please complete the captcha'),
  email: z.union([emptyString, z.string().trim().email('Please enter a valid email')]).optional(),
})

type SupportFormValues = z.infer<typeof supportSchema>

interface SupportModalProps {
  onClose: () => void
}

export const SupportModal = ({ onClose }: SupportModalProps) => {
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { email: '', description: '', turnstileToken: '' },
    mode: 'onSubmit',
  })

  const resetTurnstile = useCallback(() => {
    setValue('turnstileToken', '', { shouldValidate: false })
    turnstileRef.current?.reset()
  }, [setValue])

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null)
    try {
      const response = await fetch('/api/support/verify-captcha', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: values.turnstileToken }),
      })
      const data = (await response.json().catch(() => ({}))) as { success?: boolean }

      if (!response.ok || !data.success) {
        setSubmitError('Captcha verification failed. Please try again.')
        resetTurnstile()
        return
      }

      showToast({
        severity: 'success',
        title: 'Support request sent',
        content: 'Thanks — we will get back to you shortly.',
        dataTestId: 'SupportSuccessToast',
      })
      onClose()
    } catch {
      setSubmitError('Network error. Please try again.')
      resetTurnstile()
    }
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

          <Controller
            control={control}
            name="turnstileToken"
            render={({ field, fieldState: { error } }) => (
              <ErrorMessage errorMsg={error?.message} dataTestId="SupportTurnstileError">
                <div data-testid="SupportTurnstile">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={token => field.onChange(token)}
                    onExpire={() => field.onChange('')}
                    onError={() => field.onChange('')}
                    options={{ theme: 'dark' }}
                  />
                </div>
              </ErrorMessage>
            )}
          />
        </div>

        {submitError && (
          <p className="mt-4 text-error text-sm" data-testid="SupportSubmitError">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse md:flex-row gap-3 md:justify-end">
          <Button
            type="button"
            variant="secondary-outline"
            onClick={() => {
              resetTurnstile()
              onClose()
            }}
            data-testid="SupportCancel"
          >
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
