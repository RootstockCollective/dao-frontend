import { FC, useState } from 'react'
import { Modal } from '@/components/Modal/Modal'
import { Header, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { useRouter } from 'next/navigation'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

const proposalTypesOptions = ['Standard', 'Builder Activation', 'Builder Deactivation'] as const

type ProposalType = (typeof proposalTypesOptions)[number]

type ProposalTypeDetails = {
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
}

const typesMap: Record<ProposalType, ProposalTypeDetails> = {
  'Builder Activation': {
    description:
      'Ask the community to vote on adding a Builder to the RootstockCollective’s whitelist, granting them access to the Collective Rewards.',
    contract: 'BuilderRegistryAbi',
    action: 'whitelistBuilder',
  },
  'Builder Deactivation': {
    description:
      'Ask the community to vote on removing a Builder from the RootstockCollective’s whitelist, revoking their access to the Collective Rewards.',
    contract: 'BuilderRegistryAbi',
    action: 'dewhitelistBuilder',
  },
  Standard: {
    description:
      'Ask the community to vote on a request for allocation of funds from the RootstockCollective treasury for a Grant, a Growth Initiative, or other governing parameter aligned with community goals.',
    contract: 'DAOTreasuryAbi',
    action: 'withdraw',
  },
}

type ProposalSelectionModalProps = {
  onClose: () => void
}
export const ProposalSelectionModal: FC<ProposalSelectionModalProps> = ({ onClose }) => {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ProposalType | undefined>(undefined)

  return (
    <Modal onClose={onClose} width={662} className="bg-[#1A1A1A]">
      <div className="flex justify-center py-[45px]">
        <div className="w-[430px]">
          <div className="flex flex-col items-center gap-y-4">
            <Header variant="h1" fontFamily="kk-topo" className="text-center uppercase">
              Choose Proposal Type
            </Header>

            <div className="text-center self-stretch">
              <Typography tagVariant="span" className="text-[16px] font-normal" lineHeight="120%">
                Select the proposal you want to create, please take in mind the following:
              </Typography>
            </div>

            <div className="flex flex-col gap-y-3 self-stretch">
              {proposalTypesOptions.map(type => (
                <div key={type}>
                  <Typography tagVariant="span" className="text-[16px] font-bold leading-none">
                    {type}:
                  </Typography>
                  &nbsp;
                  <Typography tagVariant="span" className="text-[16px] font-normal" lineHeight="120%">
                    {typesMap[type].description}
                  </Typography>
                </div>
              ))}
            </div>

            <div className="w-full bg-[#1A1A1A]">
              <Select onValueChange={(value: ProposalType) => setSelectedType(value)}>
                <SelectTrigger className="w-full border-[#2D2D2D] bg-[#1A1A1A]">
                  <SelectValue placeholder="Select one type" />
                </SelectTrigger>
                <SelectContent className="border-[#2D2D2D] bg-[#1A1A1A]">
                  {proposalTypesOptions.map(value => (
                    <SelectItem
                      className="font-rootstock-sans font-normal text-[14px] flex h-12 p-3 self-stretch gap-2"
                      key={value}
                      value={value}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-row justify-center items-center text-center gap-x-20 py-[54px]">
            <Button
              textClassName="data[disabled]:text-disabled-secondary"
              disabled={!selectedType}
              onClick={() => {
                if (selectedType) {
                  const { contract, action } = typesMap[selectedType]
                  router.push(`/proposals/create?contract=${contract}&action=${action}`)
                }
              }}
            >
              Continue
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
