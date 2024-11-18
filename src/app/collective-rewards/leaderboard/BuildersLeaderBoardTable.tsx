import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/user'
import { useAlertContext } from '@/app/providers'
import { AddressOrAliasWithCopy } from '@/components/Address'
import { Button } from '@/components/Button'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Popover } from '@/components/Popover'
import ProgressBar from '@/components/ProgressBar'
import { TableBody, TableCell, TableCore, TableHead, TableRow } from '@/components/Table'
import { HeaderTitle, Label, Typography } from '@/components/Typography'
import { RBTC, RIF } from '@/lib/constants'
import { cn, formatCurrency, shortAddress, toFixed } from '@/lib/utils'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import { rbtcIconSrc } from '@/shared/rbtcIconSrc'
import Image from 'next/image'
import { FC, memo, useEffect, useMemo } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6'
import { Address, isAddress } from 'viem'
import { useGetBuildersRewards } from './hooks'
import { BuilderRewardPercentage } from '@/app/collective-rewards/rewards'

type Currency = {
  value: number
  symbol: string
}

export type Reward = {
  crypto: Currency
  fiat: Currency
}

type RewardCellProps = {
  rewards: Reward[]
}

export function getFormattedCurrency(value: number, symbol: string) {
  const formattedCurrency = formatCurrency(value, symbol)
  return `${formattedCurrency.substring(0, 1)}${symbol} ${formattedCurrency.substring(1)}`
}

export const RewardCell: FC<RewardCellProps> = ({ rewards }) => (
  <div className="flex flex-nowrap flex-row gap-1">
    {rewards &&
      rewards.map(({ crypto: { value, symbol }, fiat: { value: fiatValue, symbol: fiatSymbol } }) => (
        <div key={value + symbol} className="flex-1">
          {/* TODO: if the value is very small, should we show it in Gwei/wei? */}

          <div className="flex items-center">
            <Label className="font-normal text-sm leading-none text-text-primary font-rootstock-sans">
              {toFixed(value)}
            </Label>
            {symbol === RBTC && (
              <Image
                src={`data:image/svg+xml;base64,${rbtcIconSrc}`}
                alt="rBTC Logo"
                className="ml-1"
                width={18}
                height={18}
              />
            )}
            {symbol === RIF && (
              <Image src={'/images/rif-logo.png'} alt="RIF Logo" className="ml-1" width={18} height={18} />
            )}
          </div>
          <Label className="font-normal text-sm leading-none text-disabled-primary font-rootstock-sans">
            {`= ${getFormattedCurrency(fiatValue, fiatSymbol)}`}
          </Label>
        </div>
      ))}
  </div>
)

export const LazyRewardCell = memo(RewardCell, ({ rewards: prevReward }, { rewards: nextReward }) =>
  prevReward.every((reward, key) => reward.fiat.value === nextReward[key].fiat.value),
)

export const BuilderNameCell = ({ builderName, address }: { builderName: string; address: string }) => {
  const shortenAddress = shortAddress(address as Address)
  return (
    <TableCell className={cn(tableHeaders[0], 'border-solid')}>
      <div className="flex flex-row gap-x-1">
        <Jdenticon className="rounded-md bg-white" value={builderName} size="24" />
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="builderAddressTooltip">{shortenAddress}</p>
            </div>
          }
          size="small"
          trigger="hover"
          disabled={!builderName || isAddress(builderName)}
        >
          <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap min-w-28">
            <AddressOrAliasWithCopy
              addressOrAlias={builderName || address}
              clipboard={address}
              clipboardAnimationText={shortenAddress}
              className="text-sm"
            />
          </Typography>
        </Popover>
      </div>
    </TableCell>
  )
}

export const BackerRewardsPercentage = ({
  rewardPercentage,
}: {
  rewardPercentage: BuilderRewardPercentage | null
}) => {
  const renderDelta = useMemo(() => {
    if (!rewardPercentage) return null

    const deltaPercentage = rewardPercentage.next - rewardPercentage.current
    if (deltaPercentage > 0) {
      const colorGreen = '#1bc47d'
      return (
        <div className="flex flex-row items-center">
          <FaArrowUp style={{ color: colorGreen }} />
          <div className={cn(`text-[${colorGreen}] text-sm`)}>+{deltaPercentage}</div>
        </div>
      )
    }
    if (deltaPercentage < 0) {
      const colorRed = '#f14722'
      return (
        <div className="flex flex-row items-center">
          <FaArrowDown style={{ color: colorRed }} />
          <div className={cn(`text-[${colorRed}] text-sm`)}>{deltaPercentage}</div>
        </div>
      )
    }
    return null
  }, [rewardPercentage])
  return (
    <TableCell className={cn(tableHeaders[1], 'justify-center items-center gap-2 border-b-0')}>
      <div className="flex flex-row gap-x-1">
        <div>{rewardPercentage?.current}</div>
        {renderDelta}
      </div>
    </TableCell>
  )
}

export const LastCycleRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[2], 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

const ProjectedRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[3], 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

const ShareCell = ({ share }: { share: bigint }) => {
  return (
    <TableCell className={cn(tableHeaders[4], 'border-solid text-center border-b-0 items-center')}>
      <div className="flex flex-row gap-2 items-center">
        <ProgressBar progress={Number(share)} color="#1bc47d" />
        <Label>{share.toString()}%</Label>
      </div>
    </TableCell>
  )
}

const ActionCell = () => {
  return (
    <TableCell className={cn(tableHeaders[5], 'border-solid align-center')}>
      <Button disabled={true}>Select</Button>
    </TableCell>
  )
}

const tableHeaders = [
  { label: 'Builder', width: 'w-[14%]' },
  { label: 'Backer Rewards %', width: 'w-[10%]' },
  { label: 'Last Cycle Rewards', width: 'w-[22%]' },
  { label: 'Estimated Backers Rewards', width: 'w-[22%]' },
  { label: 'Total Allocations', width: 'w-[18%]', tooltip: "The Builder's share of the total allocations" },
  { label: 'Actions', width: 'w-[14%]', text_position: 'text-center' },
]

const BuildersLeaderBoardTable = () => {
  const { data: rewardsData, isLoading, error: rewardsError } = useGetBuildersRewards()
  const { setMessage: setErrorMessage } = useAlertContext()

  // pagination
  const buildersPerPage = 10
  const tableDataLength = useMemo(() => Object.keys(rewardsData).length, [rewardsData])
  const maxPages = useMemo(() => Math.ceil(tableDataLength / buildersPerPage), [tableDataLength])
  const { paginationUi, currentPage } = useBasicPaginationUi(maxPages)

  useEffect(() => {
    if (rewardsError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading RBTC rewards',
        content: rewardsError.message,
      })
      console.error('🐛 rewardsError:', rewardsError)
    }
  }, [rewardsError, setErrorMessage])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!tableDataLength) {
    return <EmptyLeaderboard />
  }

  return (
    <div className="flex flex-col gap-5">
      <TableCore>
        <TableHead>
          <TableRow>
            {tableHeaders.map(header => (
              <TableCell
                key={header.label}
                className={cn(
                  'font-rootstock-sans font-bold text-base leading-none border-b border-solid border-[#2D2D2D]',
                  header.width,
                  header.text_position,
                )}
              >
                <div className="flex flex-row">
                  {header.tooltip && (
                    <Popover
                      content={header.tooltip}
                      className="font-normal text-sm"
                      size="small"
                      trigger="hover"
                    >
                      <FaRegQuestionCircle className="mr-1 self-center" />
                    </Popover>
                  )}
                  {header.label}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(rewardsData)
            .slice(currentPage * buildersPerPage, (currentPage + 1) * buildersPerPage)
            .map(
              ([, { address, builderName, lastCycleReward, projectedReward, share, rewardPercentage }]) => (
                <TableRow key={address + share} className="text-[14px] border-hidden">
                  <BuilderNameCell builderName={builderName} address={address} />
                  <BackerRewardsPercentage rewardPercentage={rewardPercentage} />
                  <LastCycleRewardCell rewards={[lastCycleReward.RBTC, lastCycleReward.RIF]} />
                  <ProjectedRewardCell rewards={[projectedReward.RBTC, projectedReward.RIF]} />
                  <ShareCell share={share} />
                  <ActionCell />
                </TableRow>
              ),
            )}
        </TableBody>
      </TableCore>
      <div className="flex justify-center">{paginationUi}</div>
    </div>
  )
}

export const BuildersLeaderBoard = () => {
  return (
    <>
      <HeaderTitle>Rewards leaderboard</HeaderTitle>
      <BuilderContextProviderWithPrices>
        <BuildersLeaderBoardTable />
      </BuilderContextProviderWithPrices>
    </>
  )
}

const EmptyLeaderboard = () => (
  <div className="relative w-full">
    <img className="w-full h-fll object-cover" alt="no builders yet" src="/images/joining-without-text.png" />
    <Typography
      tagVariant="h1"
      className="uppercase font-kk-topo text-[48px] leading-tight font-normal absolute inset-0 flex items-center justify-center tracking-[-0.96px]"
    >
      Builders are joining soon...
    </Typography>
  </div>
)
