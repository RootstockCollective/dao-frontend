'use client'

import { FC } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { CreateBuilderProposalForm } from './CreateBuilderProposalForm'
import { RemoveBuilderProposalForm } from './RemoveBuilderProposalForm'
import { TreasuryWithdrawProposalForm } from './TreasuryWithdrawProposalForm'
import { SupportedActionAbiName, SupportedProposalActionName } from '../shared/supportedABIs'

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
    communityBanBuilder: RemoveBuilderProposalForm,
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

    return <TreasuryWithdrawProposalForm />
  }
  const ProposalComponent: FC = componentByType[contract][action]

  return <ProposalComponent />
}
