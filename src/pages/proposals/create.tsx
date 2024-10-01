import { CreateBuilderProposalForm } from '@/app/proposals/create/CreateBuilderProposalForm'
import { TreasuryProposalForm } from '@/app/proposals/create/TreasuryProposalForm'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { FC } from 'react'

export type ProposalFormByType = {
  [key in SupportedActionAbiName]: Partial<{
    [key in SupportedProposalActionName]: FC
  }>
}

const componentByType: Partial<ProposalFormByType> = {
  DAOTreasuryAbi: {
    withdraw: TreasuryProposalForm,
    withdrawERC20: TreasuryProposalForm,
  },
  SimplifiedRewardDistributorAbi: {
    whitelistBuilder: CreateBuilderProposalForm,
  },
}

const getProposalActionFromPath = (
  routerParams: ReadonlyURLSearchParams | null,
): { contract: SupportedActionAbiName; action: SupportedProposalActionName } => ({
  contract: routerParams?.get('contract') as SupportedActionAbiName,
  action: routerParams?.get('action') as SupportedProposalActionName,
})

export default function CreateProposal() {
  const routerParams = useSearchParams()

  const { contract, action } = getProposalActionFromPath(routerParams)
  if (!componentByType[contract] || !componentByType[contract][action]) {
    // Fallback to treasury proposal form

    return (
      <MainContainer>
        <TreasuryProposalForm />
      </MainContainer>
    )
  }
  const ProposalComponent: FC = componentByType[contract][action]

  return (
    <MainContainer>
      <ProposalComponent />
    </MainContainer>
  )
}
