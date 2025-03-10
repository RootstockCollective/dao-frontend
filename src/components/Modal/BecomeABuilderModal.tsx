import { ButtonHTMLAttributes, FC, useState } from 'react'
import { Modal } from '@/components/Modal/Modal'
import { Header, Paragraph, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { useRouter } from 'next/navigation'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Popover } from '../Popover'

type DisclaimerProps = {
  onAccept: () => void
  onDecline: () => void
}

const Disclaimer: FC<DisclaimerProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="flex flex-col items-center gap-y-2 py-[100px]">
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
          <Button variant="secondary" onClick={onDecline}>
            I Disagree
          </Button>
          <Button onClick={onAccept}>I Agree</Button>
        </div>
      </div>
    </div>
  )
}

const openDiscourse = () => {
  window.open('https://gov.rootstockcollective.xyz/c/collective-rewards/7', '_blank')
}

export const openKYC = () => {
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLScVB-A_SPncWpSV_4mSdeMxBKtiYvJDvPK_TKSddzPnuC9lqQ/viewform',
    '_blank',
  )
}

type ActionProps = {
  icon: JSX.Element
  text: string
  button: JSX.Element
}

const Action: FC<ActionProps> = ({ icon, text, button }) => (
  <div className="flex flex-col items-center gap-[35px] px-6 py-[26px]">
    {icon}
    {text}
    {button}
  </div>
)

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  content: string
}
const ActionButton: FC<ActionButtonProps> = ({ content, ...props }) => (
  <Button
    className="w-[156px] h-12 font-rootstock-sans text-[16px] test-bold leading-none text-center text-nowrap"
    {...props}
  >
    {content}
  </Button>
)

const BecomeABuilder: FC = () => {
  const { canCreateProposal, threshold } = useVotingPower()
  const router = useRouter()
  const contractName: SupportedActionAbiName = 'BuilderRegistryAbi'
  const action: SupportedProposalActionName = 'communityApproveBuilder'

  const submitProposal = () => router.push(`/proposals/create?contract=${contractName}&action=${action}`)

  return (
    <div className="flex flex-col items-center gap-y-2 py-[50px]">
      <Header
        variant="h1"
        fontFamily="kk-topo"
        className="text-5xl leading-tight font-normal text-center uppercase tracking-[-0.96px] mb-14"
      >
        How to become a builder
      </Header>

      <Steps />

      <div className="mt-14 flex flex-row gap-x-3">
        <Action
          icon={<SignupSvg />}
          text="Signup"
          button={<ActionButton onClick={openDiscourse} content="Go to Discourse" />}
        />
        <Action
          icon={<JoinTheClubSvg />}
          text="Join the Club"
          button={
            !canCreateProposal ? (
              <Popover
                content={
                  <Paragraph variant="normal" className="text-sm">
                    You need at least {threshold} Voting Power to create a proposal. The easiest way to get
                    more Voting Power is to Stake more RIF.
                  </Paragraph>
                }
                trigger="hover"
                background="dark"
                size="small"
                position="top"
                className="z-[100]"
              >
                <ActionButton disabled content="Submit proposal" />
              </Popover>
            ) : (
              <ActionButton onClick={submitProposal} content="Submit proposal" />
            )
          }
        />
        <Action
          icon={<GetActivatedSvg />}
          text="Get Activated"
          button={<ActionButton onClick={openKYC} content="Start KYC" />}
        />
      </div>
    </div>
  )
}

type BecomeABuilderModalProps = {
  onClose: () => void
}
export const BecomeABuilderModal: FC<BecomeABuilderModalProps> = ({ onClose }) => {
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)

  return (
    <Modal onClose={onClose} width={1016} className="overflow-auto">
      {isDisclaimerAccepted ? (
        <BecomeABuilder />
      ) : (
        <Disclaimer onAccept={() => setIsDisclaimerAccepted(true)} onDecline={onClose} />
      )}
    </Modal>
  )
}

const Steps: FC = () => {
  return (
    <ol className="list-decimal text-wrap w-[637px] font-rootstock-sans text-[16px] font-bold">
      <li>
        SIGNUP:{' '}
        <Typography tagVariant="span" className="font-normal">
          Post details on Discourse about your project and its goals.
        </Typography>
      </li>
      <li>
        JOIN THE CLUB:{' '}
        <Typography tagVariant="span" className="font-normal">
          Submit your proposal on-chain for community review and voting.
        </Typography>
      </li>
      <li>
        GET ACTIVATED:{' '}
        <Typography tagVariant="span" className="font-normal">
          Submit your KYC to the RootstockCollective Foundation for approval.
        </Typography>
      </li>
      <li className="list-none mt-4">
        Builder Activation:{' '}
        <Typography tagVariant="span" className="font-normal">
          When your KYC and Proposal get approval, you will be eligible to participate in the Collective
          Rewards.
        </Typography>
      </li>
      <li className="mt-4 list-none font-normal">
        Find out more on the RootstockCollective{' '}
        <Typography
          tagVariant="span"
          className="font-bold underline cursor-pointer"
          onClick={() =>
            window.open(
              'https://wiki.rootstockcollective.xyz/RootstockCollective-FAQ-1031ca6b0b02808c95d3dcb5a0074f4b',
              '_blank',
            )
          }
        >
          FAQ
        </Typography>
        .
      </li>
      <li className="mt-4 list-none font-normal">
        *You need to use a different address in case you stopped being a builder.
      </li>
    </ol>
  )
}

const SignupSvg = () => (
  <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Icon">
      <path
        id="Icon_2"
        d="M26.8334 21.0835H15.3334M19.1667 28.7502H15.3334M30.6667 13.4168H15.3334M38.3334 13.0335V32.9668C38.3334 36.1871 38.3334 37.7973 37.7067 39.0273C37.1554 40.1092 36.2758 40.9888 35.1939 41.5401C33.9639 42.1668 32.3537 42.1668 29.1334 42.1668H16.8667C13.6464 42.1668 12.0363 42.1668 10.8063 41.5401C9.72437 40.9888 8.84473 40.1092 8.29346 39.0273C7.66675 37.7973 7.66675 36.1871 7.66675 32.9668V13.0335C7.66675 9.81319 7.66675 8.20304 8.29346 6.97305C8.84473 5.89112 9.72437 5.01148 10.8063 4.46021C12.0363 3.8335 13.6464 3.8335 16.8667 3.8335H29.1334C32.3537 3.8335 33.9639 3.8335 35.1939 4.46021C36.2758 5.01148 37.1554 5.89112 37.7067 6.97305C38.3334 8.20304 38.3334 9.81319 38.3334 13.0335Z"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)

const JoinTheClubSvg = () => (
  <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Icon">
      <path
        id="Icon_2"
        d="M42.1666 40.25V36.4167C42.1666 32.8443 39.7233 29.8426 36.4166 28.9915M29.7083 6.30729C32.5179 7.44461 34.4999 10.1992 34.4999 13.4167C34.4999 16.6342 32.5179 19.3887 29.7083 20.526M32.5833 40.25C32.5833 36.6778 32.5833 34.8917 31.9997 33.4828C31.2215 31.6042 29.729 30.1117 27.8505 29.3336C26.4416 28.75 24.6555 28.75 21.0833 28.75H15.3333C11.761 28.75 9.97492 28.75 8.56601 29.3336C6.68746 30.1117 5.19496 31.6042 4.41684 33.4828C3.83325 34.8917 3.83325 36.6778 3.83325 40.25M25.8749 13.4167C25.8749 17.6508 22.4424 21.0833 18.2083 21.0833C13.9741 21.0833 10.5416 17.6508 10.5416 13.4167C10.5416 9.18248 13.9741 5.75 18.2083 5.75C22.4424 5.75 25.8749 9.18248 25.8749 13.4167Z"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)

const GetActivatedSvg = () => (
  <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Icon">
      <path
        id="Icon_2"
        d="M19.1667 30.6668H26.8334M16.8667 42.1668H29.1334C32.3537 42.1668 33.9639 42.1668 35.1939 41.5401C36.2758 40.9888 37.1554 40.1092 37.7067 39.0273C38.3334 37.7973 38.3334 36.1871 38.3334 32.9668V13.0335C38.3334 9.81319 38.3334 8.20304 37.7067 6.97305C37.1554 5.89112 36.2758 5.01148 35.1939 4.46021C33.9639 3.8335 32.3537 3.8335 29.1334 3.8335H16.8667C13.6464 3.8335 12.0363 3.8335 10.8063 4.46021C9.72437 5.01148 8.84473 5.89112 8.29346 6.97305C7.66675 8.20304 7.66675 9.81319 7.66675 13.0335V32.9668C7.66675 36.1871 7.66675 37.7973 8.29346 39.0273C8.84473 40.1092 9.72437 40.9888 10.8063 41.5401C12.0363 42.1668 13.6464 42.1668 16.8667 42.1668ZM28.7501 17.2502C28.7501 20.4258 26.1757 23.0002 23.0001 23.0002C19.8244 23.0002 17.2501 20.4258 17.2501 17.2502C17.2501 14.0745 19.8244 11.5002 23.0001 11.5002C26.1757 11.5002 28.7501 14.0745 28.7501 17.2502Z"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)
