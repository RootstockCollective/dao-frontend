import Image from 'next/image'
import { Modal } from '@/components/Modal/Modal'
import { HeaderTitle, Paragraph, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useState, useEffect, useMemo } from 'react'
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
import rifIcon from './images/rif-icon.svg'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { StatefulTable } from '@/components/Table'
import { DelegateIcon } from './DelegateIcon'
import { useNftHoldersWithVotingPower } from './hooks/useNftHoldersWithVotingPower'

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

  /*** Creating Shepherds table data ***/
  const nftHolders = useNftHoldersWithVotingPower()
  // React-table sorting state. Initial sorting is set by Voting power
  const [sorting, setSorting] = useState<SortingState>([{ id: 'vp', desc: true }])
  // Prepare data to display in table
  const { accessor, display } = createColumnHelper<(typeof nftHolders)[number]>()
  const columns = useMemo(
    () => [
      accessor('RNS', {
        id: 'rns',
        header: () => <Typography className="text-sm">Delegate</Typography>,
        cell: info => (
          <div className="flex flex-row items-center gap-1">
            <DelegateIcon colorIndex={info.row.index} />
            <Typography className="text-left">{info.getValue() ?? info.row.original.address}</Typography>
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.RNS && rowB.original.RNS
            ? rowA.original.RNS.localeCompare(rowB.original.RNS)
            : rowA.original.address.localeCompare(rowB.original.address)
        },
      }),
      accessor('votingPower', {
        id: 'vp',
        header: () => (
          <div className="mx-auto flex flex-row items-center gap-1">
            <Typography className="text-sm">Voting Power</Typography>
            <Image src={rifIcon} alt="RIF" className="w-[16px]" />
          </div>
        ),
        cell: info => <Typography>{(info.getValue() ?? 0).toLocaleString('en-GB')}</Typography>,
      }),
      display({
        id: 'select',
        enableSorting: false,
        cell: info => (
          <Button
            onClick={() => onAddressChange(info.row.original.address)}
            variant="white"
            className="w-[98px] h-[36px] p-0"
            data-testid="Select"
          >
            Select
          </Button>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessor, display],
  )
  // Generate table data
  const table = useReactTable({
    columns,
    data: nftHolders,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Modal onClose={onClose} className="w-full max-w-[892px] px-16 pt-10 pb-24" data-testid="DelegateModal">
      <div className="text-center">
        <HeaderTitle className="mb-[16px]" data-testid="Header">
          Choose Your Delegate
        </HeaderTitle>
        <Paragraph className="mb-12 text-sm" data-testid="Description">
          Delegate all voting power to an address. Your stRF balance{' '}
          <span className="text-primary">remains unaffected</span>.
          <br />
          Delegation can be updated anytime.
        </Paragraph>
        <div className="mb-9">
          <div className="mb-10 text-left">
            <PasteButton handlePaste={onAddressChange} className="right-3 top-11" data-testid="Paste">
              <Input
                label="Address or RNS"
                name="address"
                value={addressToDelegateTo}
                onChange={onAddressChange}
                className="mb-2"
                fullWidth
                inputProps={{ className: 'pr-16' }}
                labelProps={{ className: 'text-sm tracking-wide' }}
                labelWrapperProps={{ className: 'mb-2' }}
                data-testid="AddressInput"
              />
              <Typography className="text-sm text-white/60" data-testid="InputDescription">
                Select from trusted groups or enter a custom delegate above.
              </Typography>
            </PasteButton>
          </div>
          <div className="mb-7 pb-[6px] w-fit flex flex-row items-center gap-1 border-b border-b-primary">
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
          <div
            className="max-h-[350px] overflow-y-auto
            [&::-webkit-scrollbar]:w-3
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-track]:bg-foreground
            [&::-webkit-scrollbar-thumb]:bg-primary"
          >
            <StatefulTable table={table} equalColumns data-testid="TableShepherds" />
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
          <Button onClick={onDelegateClick} disabled={isPending || !isInputValid} data-testid="Delegate">
            Delegate
          </Button>
          <Button variant="secondary" onClick={onClose} data-testid="Cancel">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
