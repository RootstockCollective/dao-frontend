import { useParams } from 'next/navigation'
import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { FC, useMemo } from 'react'
import { getProposalEventArguments, splitCombinedName } from '@/app/proposals/shared/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/Breadcrumb'
import { HomeIcon } from '@/components/Icons/HomeIcon'
import { useProposalById } from '@/app/proposals/context'

export const ProposalDetailTopLeftComponent = () => {
  const { id } = useParams<{ id: string }>() ?? {}
  const proposal = useProposalById(id)

  const { proposalName } = splitCombinedName(proposal?.name ?? '')
  return <BreadcrumbSection title={proposalName} />
}

const BreadcrumbSection: FC<{ title: string }> = ({ title }) => {
  return (
    <Breadcrumb className="p-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <HomeIcon size={18} />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/proposals" className={'opacity-60'}>
            Proposals
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-lg truncate">{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
