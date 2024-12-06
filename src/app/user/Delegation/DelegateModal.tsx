import { Modal } from '@/components/Modal/Modal'
import { HeaderTitle, Paragraph } from '@/components/Typography'
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
      if (!isChecksumValid(value)) {
        setError('Invalid checksum address')
        return
      }
      setIsInputValid(true)
      return
    }

    if (value.endsWith('.rsk')) {
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
    <Modal onClose={onClose} width={892}>
      <div className="px-[157px] py-[45px] text-center">
        <HeaderTitle className="mb-[16px]">Delegate</HeaderTitle>
        <Paragraph className="mb-[16px]">
          This action lets you delegate all of your voting power to the selected address.
          <br />
          You can easily change or remove this delegation if needed.
        </Paragraph>
        <div className="mb-14">
          <Input
            label="Address or RNS Domain"
            name="address"
            value={addressToDelegateTo}
            onChange={onAddressChange}
            className="mb-1"
            fullWidth
            labelWrapperProps={{ className: 'text-left mb-[10px]' }}
          />
          {error && (
            <p className="text-st-error">
              {error}
              {error === 'Invalid checksum address' && (
                <>
                  {' '}
                  <span
                    className="font-normal underline cursor-pointer"
                    onClick={() =>
                      onAddressChange(checksumAddress(addressToDelegateTo as Address, Number(CHAIN_ID)))
                    }
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
