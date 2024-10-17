import { FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/Modal/Modal'
import { Header, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { BsCardText } from 'react-icons/bs'
import { RiPassportLine } from 'react-icons/ri'
import { useRouter } from 'next/navigation'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

type DisclaimerProps = {
  onAccept: () => void
  onDecline: () => void
}

const Disclaimer: FC<DisclaimerProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="flex flex-col items-center gap-y-2 py-[100px]">
      {/* TODO: we need to change it when we have access in dev mode to the design */}
      <Header variant="h1" fontFamily="kk-topo" className="text-5xl font-bold text-center uppercase">
        Disclaimer
      </Header>

      <div className="w-[672px]">
        <div className="flex flex-row pb-[50px] justify-center">
          <Typography tagVariant="span" className="text-[16px] font-light text-center">
            By submitting your request to become a whitelisted Builder in the Collective Rewards, you hereby
            acknowledge and agree to be bound to the terms of the Collective Rewards and to submit your KYC
            information to the RootstockCollective Foundation. You accept that the information submitted will
            be treated pursuant to the Privacy Policy.
          </Typography>
        </div>
        <div className="flex flex-row justify-center items-center text-center gap-x-10">
          <Button onClick={onAccept}>I Agree</Button>
          <Button variant="secondary" onClick={onDecline}>
            I Disagree
          </Button>
        </div>
      </div>
    </div>
  )
}

// TODO: check if this is a hardcoded list or if it should be dynamic
const steps: Array<Step> = [
  {
    description: 'Submit your KYC application:',
    steps: [
      {
        description: 'Submit your KYC application to the RootstockCollective Foundation for approval.',
      },
    ],
  },
  {
    description: 'Publish your proposal in Discourse:',
    steps: [
      {
        description:
          'Provide a detailed description of your project, its goal, and how it contributes to the Rootstock ecosystem.',
      },
    ],
  },
  {
    description: 'Submit your Proposal on-chain for a Community vote:',
    steps: [
      {
        description: 'Once your proposal is submitted, it will be reviewed and voted on by the community.',
      },
    ],
  },
  {
    description: 'Whitelisting:',
    steps: [
      {
        description:
          'If your KYC and proposals are approved, you will be added to the Builder whitelist and eligible to start receiving rewards.',
      },
    ],
  },
]

type BecomeABuilderProps = {
  onStartKYC: () => void
  onSubmitProposal: () => void
}

const BecomeABuilder: FC<BecomeABuilderProps> = ({ onStartKYC, onSubmitProposal }) => {
  return (
    <div className="flex flex-col items-center gap-y-2 py-[50px]">
      <Header variant="h1" fontFamily="kk-topo" className="text-5xl font-bold text-center uppercase">
        How to become a builder
      </Header>

      <div className="flex flex-row pb-[50px] justify-center">
        <Typography tagVariant="span" className="text-[16px] font-light w-9/12">
          <RecursiveOrderedList steps={steps} className="list-decimal" />
        </Typography>
      </div>
      <div className="flex flex-row justify-center items-center text-center gap-x-20">
        <div className="flex flex-col items-center gap-4">
          <RiPassportLine size={48} />
          Verify your <br /> profile persona
          <Button onClick={onStartKYC}>Start KYC</Button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <BsCardText size={48} />
          Create a <br /> proposal
          <Button onClick={onSubmitProposal}>Submit proposal</Button>
        </div>
      </div>
    </div>
  )
}

type BecomeABuilderModalProps = {
  onClose: () => void
}
export const BecomeABuilderModal: FC<BecomeABuilderModalProps> = ({ onClose }) => {
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)

  const router = useRouter()
  const contractName: SupportedActionAbiName = 'SimplifiedRewardDistributorAbi'
  const action: SupportedProposalActionName = 'whitelistBuilder'
  const formLink =
    'https://docs.google.com/forms/d/e/1FAIpQLScVB-A_SPncWpSV_4mSdeMxBKtiYvJDvPK_TKSddzPnuC9lqQ/viewform'

  return (
    <Modal onClose={onClose} width={1016}>
      {isDisclaimerAccepted ? (
        <BecomeABuilder
          onSubmitProposal={() => router.push(`/proposals/create?contract=${contractName}&action=${action}`)}
          onStartKYC={() => window.open(formLink, '_blank')}
        />
      ) : (
        <Disclaimer onAccept={() => setIsDisclaimerAccepted(true)} onDecline={onClose} />
      )}
    </Modal>
  )
}

type Step = {
  description: string
  steps?: Array<Step>
}

type RecursiveOrderedListProps = {
  steps: Array<Step>
  className?: string
}

const RecursiveOrderedList: FC<RecursiveOrderedListProps> = ({ steps, className = '' }) => {
  return (
    <ol className={cn('list-inside', className)}>
      {steps.map((step, index) => (
        <li key={index}>
          {step.description}
          {step.steps && <RecursiveOrderedList steps={step.steps} className="list-[lower-alpha] px-6" />}
        </li>
      ))}
    </ol>
  )
}
