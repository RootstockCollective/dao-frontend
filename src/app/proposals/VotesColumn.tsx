import { type VotesColumnType } from './hooks/useVotesColumn'

interface VotesColumnProps {
  column?: VotesColumnType
}

export const VotesColumn = ({ column }: VotesColumnProps) => {
  if (typeof column === 'undefined') return <></>
  const { colorClass, percentageToShow, quorumToShow, votes } = column
  return (
    <>
      <p className={colorClass}>
        {Math.floor(votes)} ({isNaN(percentageToShow) ? '-' : percentageToShow}%)
      </p>
      <p>Quorum: {isNaN(quorumToShow) ? '-' : quorumToShow}</p>
    </>
  )
}
