import { FC, useState } from 'react'
import { Modal } from '@/components/Modal/Modal'
import { Header, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { useRouter } from 'next/navigation'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

const proposalTypesOptions = ['Whitelist', 'De-whitelisting', 'Treasury'] as const

type ProposalType = (typeof proposalTypesOptions)[number]

type ProposalTypeDetails = {
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
}

const typesMap: Record<ProposalType, ProposalTypeDetails> = {
  Whitelist: {
    description:
      'This proposal adds a new member or address to the Rootstock Collective’s approved list, granting them special privileges or access. It is essential for trusted participation.',
    contract: 'SimplifiedRewardDistributorAbi',
    action: 'whitelistBuilder',
  },
  'De-whitelisting': {
    description:
      'This proposal removes a member or address from the Rootstock Collective’s approved list, revoking their special privileges or access due to inactivity or other concerns.',
    contract: 'SimplifiedRewardDistributorAbi',
    action: 'removeWhitelistedBuilder',
  },
  Treasury: {
    description:
      'A request for funds from the Rootstock Collective’s treasury to support specific projects or initiatives that align with community goals. Approval directs funds towards growth and development.',
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
                    {type} proposal:
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
                      {value} proposal
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
