import { CreateBuilderProposalForm } from '@/app/proposals/create/CreateBuilderProposalForm'
import { RemoveBuilderProposalForm } from '@/app/proposals/create/RemoveBuilderProposalForm'
import { TreasuryWithdrawProposalForm } from '@/app/proposals/create/TreasuryWithdrawProposalForm'
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
    withdraw: TreasuryWithdrawProposalForm,
    withdrawERC20: TreasuryWithdrawProposalForm,
  },
  BuilderRegistryAbi: {
    communityApproveBuilder: CreateBuilderProposalForm,
    dewhitelistBuilder: RemoveBuilderProposalForm,
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
        <TreasuryWithdrawProposalForm />
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
