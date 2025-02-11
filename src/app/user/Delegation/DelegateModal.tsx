import Image from 'next/image'
import { Modal } from '@/components/Modal/Modal'
import { HeaderTitle, Paragraph, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useState, useEffect } from 'react'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { isAddressRegex, isChecksumValid } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { CHAIN_ID } from '@/lib/constants'
import { Address, checksumAddress } from 'viem'
import { debounce } from 'lodash'
import { resolveRnsDomain } from '@/lib/rns'
import { PasteButton } from '@/components/PasteButton'
import { Popover } from '@/components/Popover'
import questionImg from '@/public/images/question.svg'

interface DelegateModalProps {
  onClose: () => void
  onDelegateTxStarted: (hash: string) => void
}

export const DelegateModal = ({ onClose, onDelegateTxStarted }: DelegateModalProps) => {
  const [addressToDelegateTo, setAddressToDelegateTo] = useState('')
  const [validRnsAddress, setValidRnsAddress] = useState('')
  const [error, setError] = useState('')
  const [domainValidationStatus, setDomainValidationStatus] = useState<
    'validating' | 'valid' | 'invalid' | ''
  >('')
  const [isInputValid, setIsInputValid] = useState(false)

  const { setMessage: setGlobalMessage } = useAlertContext()
  const { onDelegate, isPending } = useDelegateToAddress()

  const onAddressChange = (value: string) => {
    setAddressToDelegateTo(value)
    setError('')
    setIsInputValid(false)
    setDomainValidationStatus('')
    setValidRnsAddress('')

    if (!value) return

    if (isAddressRegex(value)) {
      // accepts both Metamask and RSK addresses
      if (isChecksumValid(value) || isChecksumValid(value, CHAIN_ID)) {
        setIsInputValid(true)
      } else {
        setError('Invalid checksum address.')
      }
    } else if (value.endsWith('.rsk')) {
      debouncedValidation(value)
    }
  }

  const validateRnsDomain = async (domain: string) => {
    try {
      setDomainValidationStatus('validating')
      const resolvedAddress = await resolveRnsDomain(domain)

      if (resolvedAddress) {
        setValidRnsAddress(domain)
        setAddressToDelegateTo(resolvedAddress)
        setDomainValidationStatus('valid')
        setIsInputValid(true)
        setError('')
      } else {
        setDomainValidationStatus('invalid')
        setIsInputValid(false)
        setError('Invalid RNS domain')
      }
    } catch (err) {
      setDomainValidationStatus('invalid')
      setIsInputValid(false)
      setError('Error resolving RNS domain')
    }
  }

  const debouncedValidation = debounce(validateRnsDomain, 500)

  const onDelegateClick = async () => {
    try {
      const tx = await onDelegate(addressToDelegateTo)
      onDelegateTxStarted(tx)
      setGlobalMessage(TX_MESSAGES.delegation.pending)
      onClose()
    } catch (err) {
      const errorParsed = (err as Error).toString()
      if (errorParsed.includes('User rejected the request')) {
        setError('User rejected the request.')
      }
      console.log({ errorParsed })
    }
  }

  useEffect(() => {
    return () => {
      debouncedValidation.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Modal onClose={onClose} className="w-full max-w-[892px] px-16 pt-10 pb-24">
      <div className="text-center">
        <HeaderTitle className="mb-[16px]">Choose Your Delegate</HeaderTitle>
        <Paragraph className="mb-12 text-sm">
          Delegate all voting power to an address. Your stRF balance{' '}
          <span className="text-primary">remains unaffected</span>.
          <br />
          Delegation can be updated anytime.
        </Paragraph>
        <div className="mb-14">
          <div className="mb-10 text-left">
            <PasteButton handlePaste={onAddressChange} className="right-3 top-11">
              <Input
                label="Address or RNS"
                name="address"
                value={addressToDelegateTo}
                onChange={onAddressChange}
                className="mb-2"
                fullWidth
                labelProps={{ className: 'text-sm tracking-wide' }}
                labelWrapperProps={{ className: 'mb-2' }}
              />
              <Typography className="text-sm text-white/60">
                Select from trusted groups or enter a custom delegate above.
              </Typography>
            </PasteButton>
          </div>
          <div className="pb-[6px] w-fit flex flex-row items-center gap-1 border-b border-b-primary">
            <Typography className="text-sm font-bold tracking-wide">Shepherds</Typography>
            <Popover
              contentContainerClassName="w-64"
              content={
                <Typography className="text-sm">
                  Shepherds are OG Contributors
                  <br /> trusted by the community
                </Typography>
              }
            >
              <Image src={questionImg} alt="Tooltip" className="w-[14px] opacity-40 cursor-pointer" />
            </Popover>
          </div>
          {error && (
            <p className="text-st-error">
              {error}
              {error === 'Invalid checksum address.' && (
                <>
                  {' '}
                  <span
                    className="font-normal underline cursor-pointer"
                    onClick={() => onAddressChange(checksumAddress(addressToDelegateTo as Address))}
                  >
                    Fix address.
                  </span>
                </>
              )}
            </p>
          )}
          {!error && domainValidationStatus && (
            <p className={domainValidationStatus === 'valid' ? 'text-green-400' : 'text-st-error'}>
              {domainValidationStatus === 'validating'
                ? 'Validating domain...'
                : domainValidationStatus === 'valid'
                  ? `Valid domain: ${validRnsAddress}`
                  : 'Invalid domain.'}
            </p>
          )}
        </div>
        <div className="flex flex-row justify-center gap-4">
          <Button onClick={onDelegateClick} disabled={isPending || !isInputValid}>
            Delegate
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
