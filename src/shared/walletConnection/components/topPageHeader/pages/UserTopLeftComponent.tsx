'use client'
import { dropdown } from '@/shared/contants'
import { COMPLETED, Dropdown, DropdownTopic, getGetStartedData } from '@/components/dropdown'
import { Typography } from '@/components/Typography'
import { useCallback, useEffect, useState, useRef } from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { TokenBalanceRecord } from '@/app/user/types'
import { Address } from 'viem'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Timeout } from 'react-number-format/types/types'
import { useCookiesNext } from 'cookies-next'

let interval: Timeout | undefined = undefined

const getStartedCheckRunner = (fn: () => Promise<void>) => {
  if (!interval) fn()
  else {
    clearInterval(interval)
  }

  interval = setInterval(() => {
    fn()
  }, 60000)
}

const getStartedSkipped = 'getStartedSkipped'

/**
 * Logic extracted from app\user
 * 5 Steps to get started signposting
 * @constructor
 */
export const UserTopLeftComponent = () => {
  const { balances, isBalancesLoading } = useBalancesContext()

  const { address } = useAccount()
  const router = useRouter()
  const [isGetStatedSkipped, setIsGetStartedSkipped] = useState<boolean>(true)
  const cookies = useCookiesNext()
  // Flag to let us know when it's the first fetch
  // This is because if the component unmounts and mounts, then the getStartedCheckRunner will not allow
  // the data to be fetched; causing the 5 steps to get started to not render @TODO refine
  const isFirstFetch = useRef(true)

  useEffect(() => {
    setIsGetStartedSkipped(Boolean(cookies.getCookie(getStartedSkipped)))
  }, [isGetStatedSkipped, cookies])

  const [dropdownData, setDropdownData] = useState<DropdownTopic[] | null>(null)

  const skipGetStarted = useCallback(async () => {
    cookies.setCookie(getStartedSkipped, true)
    setIsGetStartedSkipped(true)
  }, [cookies])

  const setGetStartedDropdownData = useCallback(
    async (router: AppRouterInstance, balances: TokenBalanceRecord, address: Address) => {
      const dropdownData = await getGetStartedData(router, balances, address)
      setDropdownData(dropdownData)
    },
    [],
  )

  useEffect(() => {
    // TODO: check how often the dependencies update to minimize re-render
    // TODO: find a better way to cache and refresh the getStartedSteps
    if (address && !isBalancesLoading) {
      // If this is the first time fetching, run it, else go through the getStartedCheckRunner throttle @TODO refine
      if (isFirstFetch.current) {
        isFirstFetch.current = true
        setGetStartedDropdownData(router, balances, address)
      } else {
        getStartedCheckRunner(() => setGetStartedDropdownData(router, balances, address))
      }
    }
  }, [router, balances, isBalancesLoading, address, setGetStartedDropdownData])
  if (!address) {
    return null
  }

  if (!isGetStatedSkipped && dropdownData) {
    return (
      <Dropdown
        title={dropdown.steps}
        subtitle={`(${dropdownData[1] ? dropdownData[1].items.length : '0'}/5 ${COMPLETED})`}
        description={dropdown.influencerDesc}
        data={dropdownData}
        footer={
          <Typography
            className="text-[12px] text-center leading-none text-[#171412] font-normal font-rootstock-sans hover:underline"
            cursor="pointer"
            onClick={skipGetStarted}
          >
            {dropdown.already_familiar}
          </Typography>
        }
      />
    )
  }
  return null
}
