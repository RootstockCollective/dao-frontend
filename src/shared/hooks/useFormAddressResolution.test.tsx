import { zodResolver } from '@hookform/resolvers/zod'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { btcAddWhitelistSchema } from '@/app/fund-admin/sections/whitelist/schema'

import { useFormAddressResolution } from './useFormAddressResolution'

const mocks = vi.hoisted(() => ({ resolveRnsDomain: vi.fn(), onValid: vi.fn() }))

vi.mock('@/lib/rns', async importOriginal => ({
  ...(await importOriginal<object>()),
  resolveRnsDomain: (domain: string) => mocks.resolveRnsDomain(domain),
  getEnsDomainName: () => Promise.resolve(undefined),
}))

const ALICE = '0x00000000000000000000000000000000000000a1'
const BOB = '0x00000000000000000000000000000000000000b2'
const TYPED = '0x00000000000000000000000000000000000000ab'
const DEBOUNCE = 600

const text = (testId: string) => screen.getByTestId(testId).textContent
const type = (value: string) => fireEvent.change(screen.getByTestId('input'), { target: { value } })
const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

/** A lookup that stays in flight until the returned function is called */
const holdLookup = () => {
  let release: (address: string) => void = () => {}
  mocks.resolveRnsDomain.mockImplementation(
    () =>
      new Promise<string>(resolve => {
        release = resolve
      }),
  )
  return (address: string) => release(address)
}

function Fields() {
  const { register, watch } = useFormContext()
  const { isResolving } = useFormAddressResolution()
  return (
    <>
      <input data-testid="input" {...register('targetAddressInput')} />
      <span data-testid="resolved">{watch('targetAddress')}</span>
      <span data-testid="rns">{watch('targetAddressRNS')}</span>
      <span data-testid="resolving">{String(isResolving)}</span>
    </>
  )
}

function HookHarness() {
  const methods = useForm({
    defaultValues: {
      targetAddressInput: '',
      targetAddress: '',
      targetAddressRNS: '',
      targetAddressError: '',
    },
  })
  return (
    <FormProvider {...methods}>
      <Fields />
    </FormProvider>
  )
}

function WhitelistFields() {
  const { register, watch, handleSubmit } = useFormContext()
  useFormAddressResolution({
    rnsOrAddressFieldName: 'walletAddressInput',
    resolvedAddressFieldName: 'walletAddress',
    rnsFieldName: 'walletAddressRNS',
    errorFieldName: 'walletAddressError',
  })
  return (
    <>
      <input data-testid="input" {...register('walletAddressInput')} />
      <span data-testid="resolved">{watch('walletAddress')}</span>
      <button
        data-testid="submit"
        onClick={() => handleSubmit(data => mocks.onValid(data.walletAddress))()}
      />
    </>
  )
}

/** The fund-admin whitelist form: same schema, field names and validation modes */
function WhitelistFormHarness() {
  const methods = useForm({
    resolver: zodResolver(btcAddWhitelistSchema),
    defaultValues: {
      walletAddressInput: '',
      walletAddress: '',
      walletAddressError: '',
      walletAddressRNS: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  return (
    <FormProvider {...methods}>
      <WhitelistFields />
    </FormProvider>
  )
}

describe('useFormAddressResolution', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('ignores a name lookup that resolves after the field was replaced', async () => {
    const release = holdLookup()
    render(<HookHarness />)

    type('slow.rsk')
    await wait(DEBOUNCE + 100)
    expect(mocks.resolveRnsDomain).toHaveBeenCalledWith('slow.rsk')

    type(TYPED)
    await wait(DEBOUNCE + 100)
    expect(text('resolved')).toBe(TYPED)

    release(ALICE)
    await wait(0)

    expect(text('resolved')).toBe(TYPED)
    expect(text('rns')).toBe('')
  })

  it('ignores a name lookup that resolves while the next edit is still being debounced', async () => {
    const release = holdLookup()
    render(<HookHarness />)

    type('slow.rsk')
    await wait(DEBOUNCE + 100)
    type(TYPED)
    await wait(100)
    release(ALICE)
    await wait(0)

    expect(text('resolved')).toBe('')
    expect(text('rns')).toBe('')

    await wait(DEBOUNCE)
    expect(text('resolved')).toBe(TYPED)
    expect(text('resolving')).toBe('false')
  })

  it('drops the resolved address as soon as the field is edited', async () => {
    mocks.resolveRnsDomain.mockImplementation((domain: string) =>
      domain === 'alice.rsk' ? Promise.resolve(ALICE) : new Promise<string>(() => {}),
    )
    render(<HookHarness />)

    type('alice.rsk')
    await wait(DEBOUNCE + 100)
    expect(text('resolved')).toBe(ALICE)
    expect(text('rns')).toBe('alice.rsk')

    type('bob.rsk')
    await wait(100)
    expect(text('resolved')).toBe('')
    expect(text('rns')).toBe('')

    // bob.rsk is still being looked up
    await wait(DEBOUNCE * 3)
    expect(text('resolved')).toBe('')
  })

  it('resolves again when the same text is restored before the debounce fires', async () => {
    mocks.resolveRnsDomain.mockResolvedValue(ALICE)
    render(<HookHarness />)

    type('alice.rsk')
    await wait(DEBOUNCE + 100)
    type('alice.rskx')
    await wait(100)
    type('alice.rsk')
    await wait(DEBOUNCE * 2)

    expect(text('resolved')).toBe(ALICE)
    expect(text('rns')).toBe('alice.rsk')
    expect(text('resolving')).toBe('false')
  })

  it('does not let the form submit the previous address while the edited field is unresolved', async () => {
    let releaseBob: (address: string) => void = () => {}
    mocks.resolveRnsDomain.mockImplementation((domain: string) =>
      domain === 'alice.rsk'
        ? Promise.resolve(ALICE)
        : new Promise<string>(resolve => {
            releaseBob = resolve
          }),
    )
    const submit = async () => {
      fireEvent.click(screen.getByTestId('submit'))
      await wait(50)
    }
    render(<WhitelistFormHarness />)

    type('alice.rsk')
    await wait(DEBOUNCE + 100)
    expect(text('resolved')).toBe(ALICE)

    // Inside the debounce of the edit
    type('bob.rsk')
    await wait(50)
    await submit()
    expect(mocks.onValid).not.toHaveBeenCalled()

    // While bob.rsk is being looked up
    await wait(DEBOUNCE + 100)
    await submit()
    expect(mocks.onValid).not.toHaveBeenCalled()

    releaseBob(BOB)
    await wait(0)
    await submit()
    expect(mocks.onValid).toHaveBeenCalledTimes(1)
    expect(mocks.onValid.mock.calls[0][0].toLowerCase()).toBe(BOB)
  })
})
