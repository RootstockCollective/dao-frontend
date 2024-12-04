import { Modal } from '@/components/Modal/Modal'
import { HeaderTitle, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useState, useEffect } from 'react'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { isAddressRegex, isChecksumValid } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { debounce } from 'lodash'
import { resolveRnsDomain } from '@/lib/rns'
import { CHAIN_ID } from '@/lib/constants'

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

  // Global Alert
  const { setMessage: setGlobalMessage } = useAlertContext()
  const { onDelegate, isPending } = useDelegateToAddress()

  // Debounced RNS domain validation
  const validateRnsDomain = async (domain: string) => {
    try {
      setDomainValidationStatus('validating')
      const resolvedAddress = await resolveRnsDomain(domain)

      if (resolvedAddress) {
        setAddressToDelegateTo(resolvedAddress)
        setDomainValidationStatus('valid')
        setIsInputValid(true)
        setValidRnsAddress(domain)
        return true
      }

      setDomainValidationStatus('invalid')
      setIsInputValid(false)
      return false
    } catch {
      setDomainValidationStatus('invalid')
      setIsInputValid(false)
      return false
    }
  }

  const debouncedValidateRnsDomain = debounce((domain: string) => {
    if (domain.endsWith('.rsk')) validateRnsDomain(domain)
    else setDomainValidationStatus('')
  }, 500)

  const onAddressChange = (value: string) => {
    setAddressToDelegateTo(value.toLowerCase())
    setError('')
    // Trigger RNS domain validation
    debouncedValidateRnsDomain(value)
    // Check if it's a valid address immediately
    if (isAddressRegex(value)) {
      setDomainValidationStatus('valid') // Treat valid addresses as valid immediately
    }
  }

  useEffect(() => {
    // Update input validity state based on address or domain validation
    setIsInputValid(isAddressRegex(addressToDelegateTo) || domainValidationStatus === 'valid')
  }, [addressToDelegateTo, domainValidationStatus])

  const onDelegateClick = async () => {
    setError('')
    // Validate address or RNS domain
    const isValid = isAddressRegex(addressToDelegateTo) || domainValidationStatus === 'valid'

    if (!isValid) {
      setError('Please insert a valid address or RNS domain.')
      return
    }

    if (!isChecksumValid(addressToDelegateTo, CHAIN_ID)) {
      setError('Address has invalid checksum.')
      return
    }

    const onDelegatePromise = onDelegate(addressToDelegateTo)

    onDelegatePromise.then(txHash => {
      setGlobalMessage(TX_MESSAGES.delegation.pending)
      onClose()
      onDelegateTxStarted(txHash)
    })

    onDelegatePromise.catch(err => {
      if ('toString' in err) {
        const errorParsed = err.toString()
        if (errorParsed.includes('User rejected the request')) {
          setError('User rejected the request.')
        }
        console.log({ errorParsed })
      }
    })
  }

  return (
    <Modal onClose={onClose} width={892}>
      <div className="px-[157px] py-[45px] text-center">
        <HeaderTitle className="mb-[16px]">Delegate</HeaderTitle>
        <Paragraph className="mb-[16px]">
          This action lets you delegate all of your voting power to the selected address.
          <br />
          You can easily change or remove this delegation if needed.
        </Paragraph>
        {/* Input Container */}
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
          {error && <p className="text-st-error">{error}</p>}
          {!error && domainValidationStatus && (
            <p className={domainValidationStatus === 'valid' ? 'text-green-400' : 'text-st-error'}>
              {' '}
              {domainValidationStatus === 'validating'
                ? 'Validating domain...'
                : domainValidationStatus === 'valid'
                  ? `Valid domain: ${validRnsAddress}`
                  : 'Invalid domain.'}
            </p>
          )}
        </div>
        {/* Button */}
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
