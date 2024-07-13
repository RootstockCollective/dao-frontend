import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { TextInput } from '@/components/TextInput'
import { Header, Label, Paragraph, Typography } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'
import { FC, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { FaCopy } from 'react-icons/fa6'

export type Vote = 'for' | 'against' | 'abstain'

interface Props {
  onSubmit: (voting: Vote) => void
  onClose: () => void
  proposal: any
  address: string
  votingPower: number
  errorMessage?: string
}

export const VoteProposalModal: FC<Props> = ({
  onClose,
  onSubmit,
  proposal,
  address,
  votingPower,
  errorMessage,
}) => {
  const [voting, setVoting] = useState<Vote | null>(null)
  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (voting) {
      onSubmit(voting)
    }
  }
  return (
    <Modal onClose={onClose} width={756}>
      <div className="px-[50px] pt-[21px] pb-[42px] flex justify-center flex-col">
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
        <Label variant="semibold" className="mt-4">
          Wallet
        </Label>
        <div className="p-[15px] bg-input-bg flex gap-2 items-center justify-between w-1/2 rounded-[6px]">
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

        <Label variant="semibold" className="mt-4">
          Vote
        </Label>
        <div className="flex gap-4 mt-2">
          {voting === 'for' ? (
            <Button
              variant="primary"
              className="w-1/3 border border-white bg-st-success bg-opacity-10"
              textClassName="text-white"
              onClick={() => setVoting(null)}
            >
              For
            </Button>
          ) : (
            <Button variant="secondary" className="w-1/3" onClick={() => setVoting('for')}>
              For
            </Button>
          )}

          {voting === 'against' ? (
            <Button
              variant="primary"
              className="w-1/3 border border-white bg-st-error bg-opacity-10"
              textClassName="text-white"
              onClick={() => setVoting(null)}
            >
              Against
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-1/3 border-st-error"
              textClassName="text-st-error"
              onClick={() => setVoting('against')}
            >
              Against
            </Button>
          )}

          {voting === 'abstain' ? (
            <Button
              variant="primary"
              className="w-1/3 border border-white bg-gray-600"
              textClassName="text-white"
              onClick={() => setVoting(null)}
            >
              Abstain
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-1/3 border-gray-600"
              textClassName="text-gray-600"
              onClick={() => setVoting('abstain')}
            >
              Abstain
            </Button>
          )}
        </div>
        {errorMessage && <Label className="bg-st-error mt-2 p-4">Error: {errorMessage}</Label>}
        <div className="flex justify-center mt-8">
          <Button onClick={handleSubmit} disabled={!voting}>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
