import { Modal } from '@/components/Modal/Modal'
import { HeaderTitle, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useState } from 'react'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { isAddressRegex, isChecksumValid } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { CHAIN_ID } from '@/lib/constants'

interface DelegateModalProps {
  onClose: () => void
  onDelegateTxStarted: (hash: string) => void
}

export const DelegateModal = ({ onClose, onDelegateTxStarted }: DelegateModalProps) => {
  // NOTE: this might use RNS in the future
  const [addressToDelegateTo, setAddressToDelegateTo] = useState('')
  const [error, setError] = useState('')
  // Global Alert
  const { setMessage: setGlobalMessage } = useAlertContext()
  const onAddressChange = (value: string) => {
    setAddressToDelegateTo(value)
    setError('')
  }

  const { onDelegate, isPending } = useDelegateToAddress()

  const onDelegateClick = async () => {
    setError('')
    // Validate address is valid
    const isValid = isAddressRegex(addressToDelegateTo)

    if (!isValid) {
      setError('Please insert a valid address.')
      return
    }
    if (!isChecksumValid(addressToDelegateTo, CHAIN_ID)) {
      setError('Address has invalid checksum.')
      return
    }

    // If address is valid
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
            label="Address"
            name="address"
            value={addressToDelegateTo}
            onChange={onAddressChange}
            className="mb-1"
            fullWidth
            labelWrapperProps={{ className: 'text-left mb-[10px]' }}
          />
          {error && <p className="text-st-error">{error}</p>}
        </div>
        {/* Button */}
        <div className="flex flex-row justify-center gap-4">
          <Button onClick={onDelegateClick} disabled={isPending || !addressToDelegateTo}>
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
