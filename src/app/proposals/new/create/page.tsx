'use client'

import { FC } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { GrantsProposalForm } from './proposal-forms/GrantsProposalForm'
import { ActivationProposalForm } from './proposal-forms/ActivationProposalForm'
import { DeactivationProposalForm } from './proposal-forms/DeactivationProposalForm'
import { SupportedActionAbiName, SupportedProposalActionName } from '../../shared/supportedABIs'

export type ProposalFormByType = {
  [key in SupportedActionAbiName]: Partial<{
    [key in SupportedProposalActionName]: FC
  }>
}

const componentByType: Partial<ProposalFormByType> = {
  DAOTreasuryAbi: {
    withdraw: GrantsProposalForm,
    withdrawERC20: GrantsProposalForm,
  },
  BuilderRegistryAbi: {
    communityApproveBuilder: ActivationProposalForm,
    dewhitelistBuilder: DeactivationProposalForm,
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

    return <GrantsProposalForm />
  }
  const ProposalComponent: FC = componentByType[contract][action]

  return <ProposalComponent />
}
