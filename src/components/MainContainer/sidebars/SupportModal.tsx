'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useCallback, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { z } from 'zod'

import { Button } from '@/components/Button'
import { SelectField, TextArea, TextInput } from '@/components/FormFields'
import { ErrorMessage } from '@/components/FormFields/ErrorMessage'
import { Modal } from '@/components/Modal'
import { Select } from '@/components/Select'
import { Header, Paragraph, Span } from '@/components/Typography'
import {
  isSupportReferenceType,
  isValidSupportReference,
  MAX_SUPPORT_REFERENCE_LENGTH,
  SUPPORT_REFERENCE_ERRORS,
  SUPPORT_REFERENCE_LABELS,
  SUPPORT_REFERENCE_MAX_LENGTHS,
  SUPPORT_REFERENCE_TYPES,
  SUPPORT_TOPICS,
} from '@/shared/constants'
import { showToast } from '@/shared/notification'

// Cloudflare-published test key that always passes verification. Never ship it —
// paired with a matching test secret it would let any client through without a
// real captcha.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'

const envSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

if (process.env.NODE_ENV === 'production' && !envSiteKey) {
  throw new Error(
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY must be set in production. The test siteKey always passes and must never ship.',
  )
}

const TURNSTILE_SITE_KEY = envSiteKey || TURNSTILE_TEST_SITE_KEY

const emptyString = z.literal('').transform(() => {})

const supportSchema = z
  .object({
    topic: z.enum(SUPPORT_TOPICS, { message: 'Please select a topic' }),
    referenceType: z.enum(SUPPORT_REFERENCE_TYPES, { message: 'Please select a reference type' }),
    reference: z.string().trim().min(1, 'This field is required'),
    description: z
      .string()
      .trim()
      .min(10, 'Please provide at least 10 characters')
      .max(1000, 'Description must be under 1000 characters'),
    turnstileToken: z.string().min(1, 'Please complete the captcha'),
    email: z.union([emptyString, z.string().trim().email('Please enter a valid email')]).optional(),
  })
  .superRefine(({ referenceType, reference }, ctx) => {
    if (reference && !isValidSupportReference(referenceType, reference)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reference'],
        message: SUPPORT_REFERENCE_ERRORS[referenceType],
      })
    }
  })

type SupportFormValues = z.infer<typeof supportSchema>

const resolveSubmitError = (status: number, errorCode?: string): string => {
  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  if (status === 413) {
    return 'Your message is too large. Please shorten it and try again.'
  }
  switch (errorCode) {
    case 'delivery_failed':
      return 'Could not deliver your request. Please try again in a moment.'
    case 'invalid_email':
      return 'Please enter a valid email.'
    case 'invalid_description':
      return 'Please provide a description between 10 and 1000 characters.'
    case 'invalid_topic':
      return 'Please select a valid topic.'
    case 'invalid_reference_type':
      return 'Please select a valid reference type.'
    case 'invalid_reference':
      return 'Please enter a valid wallet address or transaction hash.'
    case 'server_misconfigured':
    case 'verification_failed':
      return 'Something went wrong on our side. Please try again later.'
    case 'captcha_failed':
    default:
      return 'Captcha verification failed. Please try again.'
  }
}

interface SupportModalProps {
  onClose: () => void
}

export const SupportModal = ({ onClose }: SupportModalProps) => {
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { address } = useAccount()

  const {
    clearErrors,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      email: '',
      description: '',
      turnstileToken: '',
      referenceType: 'Wallet address',
      reference: address ?? '',
    },
    mode: 'onSubmit',
  })

  const watchedReferenceType = watch('referenceType')
  const referenceType = isSupportReferenceType(watchedReferenceType) ? watchedReferenceType : undefined

  const handleReferenceTypeChange = useCallback(
    (value: string, onChange: (next: string) => void) => {
      onChange(value)
      const nextType = isSupportReferenceType(value) ? value : undefined
      setValue('reference', nextType === 'Wallet address' ? (address ?? '') : '', {
        shouldValidate: false,
      })
      clearErrors('reference')
    },
    [address, clearErrors, setValue],
  )

  const resetTurnstile = useCallback(() => {
    setValue('turnstileToken', '', { shouldValidate: false })
    turnstileRef.current?.reset()
  }, [setValue])

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null)
    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: values.turnstileToken,
          topic: values.topic,
          referenceType: values.referenceType,
          reference: values.reference,
          description: values.description,
          email: values.email,
        }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
        ticket?: string
      }

      if (!response.ok || !data.success) {
        setSubmitError(resolveSubmitError(response.status, data.error))
        resetTurnstile()
        return
      }

      showToast({
        severity: 'success',
        title: 'Support request sent',
        content: data.ticket
          ? `Thanks — we will get back to you shortly. Your reference is ${data.ticket}.`
          : 'Thanks — we will get back to you shortly.',
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
          <div className="flex flex-col gap-1.5">
            <Span variant="tag" className="text-text-60">
              What do you need help with?
            </Span>
            <SelectField
              name="topic"
              control={control}
              options={[...SUPPORT_TOPICS]}
              placeholder="Select a topic"
              data-testid="SupportTopic"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Span variant="tag" className="text-text-60">
              Wallet address or transaction hash
            </Span>
            <Controller
              control={control}
              name="referenceType"
              render={({ field, fieldState: { error } }) => (
                <ErrorMessage errorMsg={error?.message} dataTestId="SupportReferenceTypeError">
                  <Select
                    options={[...SUPPORT_REFERENCE_TYPES]}
                    placeholder="Select a reference type"
                    value={field.value}
                    onBlur={field.onBlur}
                    onValueChange={value => handleReferenceTypeChange(value, field.onChange)}
                    data-testid="SupportReferenceType"
                  />
                </ErrorMessage>
              )}
            />
            <TextInput
              name="reference"
              control={control}
              label={
                referenceType ? SUPPORT_REFERENCE_LABELS[referenceType] : 'Wallet address or transaction hash'
              }
              maxLength={
                referenceType ? SUPPORT_REFERENCE_MAX_LENGTHS[referenceType] : MAX_SUPPORT_REFERENCE_LENGTH
              }
              spellCheck={false}
              data-testid="SupportReference"
            />
            <Span variant="body-xs" className="text-text-60">
              Required — it lets us trace your issue on-chain.
            </Span>
          </div>

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
                    onExpire={() => {
                      field.onChange('')
                      setSubmitError(null)
                    }}
                    onError={() => {
                      field.onChange('')
                      setSubmitError(null)
                    }}
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
