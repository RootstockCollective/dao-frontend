import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { Input } from '@/components/Input'
import { Header, Label, Paragraph, Span, Typography } from '@/components/Typography'
import { shortAddress, toFixed, truncateMiddle } from '@/lib/utils'
import { FC, useState } from 'react'
import { FaCopy } from 'react-icons/fa6'
import { Address } from 'viem'
import Image from 'next/image'

export type Vote = 'for' | 'against' | 'abstain'

interface Props {
  onSubmit: (voting: Vote) => void
  onClose: () => void
  proposal: any
  address: Address
  votingPower: string
  isVoting?: boolean
  errorMessage?: string
}

export const VoteProposalModal: FC<Props> = ({
  onClose,
  onSubmit,
  proposal,
  address,
  votingPower,
  isVoting,
  errorMessage,
}) => {
  const [vote, setVoting] = useState<Vote | null>(null)
  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (vote) {
      onSubmit(vote)
    }
  }
  return (
    <Modal onClose={onClose} width={756}>
      <div className="px-[50px] pt-[21px] pb-[42px] flex justify-center flex-col">
        <Paragraph className="text-bold text-[24px] text-center mb-4">VOTING</Paragraph>
        <Header variant="h1" className="font-semibold">
          {proposal.title}
        </Header>
        <div className="flex flex-row justify-between mt-4">
          <Paragraph className="text-sm text-gray-500 font-normal">
            Proposed by:
            <br />
            <Span className="text-primary font-semibold">{shortAddress(proposal.proposer)}</Span>
          </Paragraph>
          <Paragraph className="text-sm text-gray-500 font-normal ml-4">
            Created at:
            <br />
            <Span className="text-primary font-semibold">{proposal.Starts.format('YYYY-MM-DD')}</Span>
          </Paragraph>
          <Paragraph className="text-sm text-gray-500 ml-4 font-normal">
            Proposal ID:
            <br />
            <Span className="text-primary font-semibold">{truncateMiddle(proposal.proposalId)}</Span>
          </Paragraph>
        </div>
        <Label variant="semibold" className="mt-4">
          Wallet
        </Label>
        <div className="p-[15px] bg-input-bg flex gap-2 items-center justify-between w-1/2 rounded-[6px]">
          {/* @TODO insert provider image */}
          <Image
            src="/images/metamask.svg"
            alt="metamask"
            width={0}
            height={0}
            style={{ width: '22px', height: 'auto' }}
          />
          <Typography tagVariant="span" className="flex-1">
            {shortAddress(address, 10)}
          </Typography>
          <button title="Copy address to clipboard" onClick={() => navigator.clipboard.writeText(address)}>
            <FaCopy />
          </button>
        </div>

        <Input
          label="Voting Power"
          name="votingPower"
          value={toFixed(votingPower)}
          className="mt-4"
          fullWidth
          readonly
        />

        <Label variant="semibold" className="mt-4">
          Vote
        </Label>
        <div className="flex gap-4 mt-2">
          {vote === 'for' ? (
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

          {vote === 'against' ? (
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

          {vote === 'abstain' ? (
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
          <Button onClick={handleSubmit} disabled={!vote || isVoting} loading={isVoting}>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
