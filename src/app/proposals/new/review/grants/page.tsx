'use client'

import { ReactNode, useCallback, useEffect } from 'react'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'
import { cn, formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { useAccount } from 'wagmi'
import moment from 'moment'
import { TokenIcon } from '@/app/proposals/icons/TokenIcon'

export default function GrantsProposalReview() {
  const { address } = useAccount()
  const { record, setRecord } = useReviewProposal()

  const onSubmit = useCallback(() => {
    try {
      setRecord(null)
    } catch (error) {
      //
    }
    // eslint-disable-next-line
  }, [])

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Publish proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])

  // verify that the context has passed correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Grants) return null
  const { description, discourseLink, proposalName, targetAddress, token, transferAmount } = record.form
  const tokenAmount = formatNumberWithCommas(transferAmount)
  return (
    <div>
      <h2 className="mb-10 font-kk-topo text-text-100 text-3xl uppercase leading-10 tracking-wide">
        {proposalName}
      </h2>
      <div className="w-full flex flex-col md:flex-row gap-2">
        <div className="grow-3 max-w-[760px] overflow-hidden">
          <div className="p-6 w-full bg-bg-80 rounded-sm flex flex-col">
            <div className="mb-14 grid grid-cols-2 gap-y-6 gap-x-2">
              <Card title="Proposal type">
                <span className="mr-2">Transfer of {tokenAmount}</span>
                <span className="whitespace-nowrap">
                  <TokenIcon token={token} className="w-4 h-4 mb-[2px] mr-1" />
                  {token}
                </span>
              </Card>
              <Card title="Created on">{moment().format('DD MMMM YYYY')}</Card>
              <Card title="Proposed by">{shortAddress(address)}</Card>
              <Card title="Community discussion">
                <a className="hover:underline" href={discourseLink} target="_blank">
                  {discourseLink}
                </a>
              </Card>
            </div>
            <h3 className="mb-10 text-xl font-kk-topo text-text-100 uppercase leading-none tracking-tight">
              Description
            </h3>
            <div className="font-rootstock-sans text-text-100 leading-normal">
              {description.split('\n').map((paragraph, i) => (
                <p className="mb-8" key={i}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="grow p-6 bg-bg-80 rounded-sm overflow-hidden md:self-start">
          <h3 className="mb-4 text-xl font-kk-topo text-text-100 uppercase leading-relaxed tracking-tight">
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <Card title="Type">Transfer</Card>
            <Card title="To address">{shortAddress(targetAddress)}</Card>
            <Card title="Amount">
              <span className="mr-2">{tokenAmount}</span>
              <span className="whitespace-nowrap">
                <TokenIcon token={token} className="w-4 h-4 mr-1 mb-[2px]" />
                {token}
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
