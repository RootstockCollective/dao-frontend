import { Header, Paragraph, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { FC } from 'react'
import { FaUser } from 'react-icons/fa'
import { shortAddress } from '@/lib/utils'
import { FaClipboard, FaCopy } from 'react-icons/fa6'
import { TextInput } from '@/components/TextInput'

interface Props {
  onSubmit: () => void
  onClose: () => void
  proposal: any
  address: string
  votingPower: number
}

export const VoteProposalModal: FC<Props> = ({ onClose, onSubmit, proposal, address, votingPower }) => {
  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <Modal onClose={onClose} width={756}>
      <div className="px-[50px] pt-[42px] pb-[84px] flex justify-center flex-col">
        <Paragraph className="text-bold text-[24px] text-center mb-4">Voting</Paragraph>
        <Header variant="h1" className="font-semibold">
          {proposal.title}
        </Header>
        <div className="flex flex-row mt-4">
          <Paragraph className="text-sm text-gray-500 font-normal">
            Proposed by: <span className="text-primary font-semibold">{proposal.proposedBy}</span>
          </Paragraph>
          <Paragraph className="text-sm text-gray-500 font-normal ml-4">
            Created at: <span className="text-primary font-semibold">{proposal.created.toDateString()}</span>
          </Paragraph>
          <Paragraph className="text-sm text-gray-500 ml-4 font-normal">
            Proposal ID: <span className="text-primary font-semibold">{proposal.id}</span>
          </Paragraph>
        </div>
        <Paragraph className="text-sm font-bold mt-4">Wallet</Paragraph>
        <div className="p-[15px] bg-input-bg flex gap-2 items-center justify-between w-[50%] rounded-[6px]">
          <FaUser /> {/* @TODO insert provider image */}
          <Typography tagVariant="span" className="flex-1">
            {shortAddress(address, 10)}
          </Typography>
          <button title="Copy address to clipboard" onClick={() => navigator.clipboard.writeText(address)}>
            <FaCopy />
          </button>
        </div>

        <TextInput
          label="Voting Power"
          name="votingPower"
          onChange={() => {}}
          value={votingPower.toString()}
          className="mt-4"
          fullWidth
          readonly
        />

        <Paragraph className="text-sm font-bold mt-4">Vote</Paragraph>

        <form onSubmit={onSubmit}>
          <div className="w-full flex justify-center mt-2 gap-6">
            <Button onClick={handleSubmit} buttonProps={{ type: 'submit' }}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
